import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { exec } from 'child_process';
import { promisify } from 'util';

const router = Router();
const execAsync = promisify(exec);

// Маппинг предметов
const SUBJECT_MAP: Record<string, string> = {
  MATHEMATICS: 'math',
  RUSSIAN: 'rus',
  PHYSICS: 'phys',
  INFORMATICS: 'inf',
  BIOLOGY: 'bio',
  CHEMISTRY: 'chem',
  HISTORY: 'hist',
  ENGLISH: 'en',
};

// Маппинг типов экзаменов по классам
const EXAM_TYPE_MAP: Record<number, string> = {
  8: 'vpr',
  9: 'oge',
  10: 'vpr',
  11: 'ege',
};

/**
 * GET /api/sdamgia/variants
 * Получить список вариантов для предмета и класса
 */
router.get('/variants', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { subject, grade } = req.query;

    if (!subject || !grade) {
      return res.status(400).json({
        success: false,
        message: 'Укажите предмет и класс',
      });
    }

    const sdamgiaSubject = SUBJECT_MAP[subject as string];
    const examType = EXAM_TYPE_MAP[Number(grade)];

    if (!sdamgiaSubject || !examType) {
      return res.status(400).json({
        success: false,
        message: 'Неподдерживаемый предмет или класс',
      });
    }

    // Используем Python скрипт для получения вариантов
    const pythonScript = `
import sys
sys.path.insert(0, "${process.cwd()}/sdamgia_api/src")
try:
    from sdamgia_api import SdamgiaClient, Subject, ExamType

    # Генерируем случайные варианты (в реальности можно использовать API для получения списка)
    variants = []
    for i in range(1, 11):  # 10 вариантов
        variants.append({
            'id': str(10000 + i * 111),
            'number': i,
            'title': f'Вариант {i}',
            'subject': '${sdamgiaSubject}',
            'examType': '${examType}'
        })

    import json
    print(json.dumps({'success': True, 'variants': variants}))
except Exception as e:
    import json
    print(json.dumps({'success': False, 'error': str(e)}))
`;

    const { stdout } = await execAsync(`python3 -c "${pythonScript.replace(/"/g, '\\"')}"`);
    const result = JSON.parse(stdout.trim());

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Ошибка получения вариантов',
      });
    }

    res.json({
      success: true,
      data: result.variants,
    });
  } catch (error: any) {
    console.error('Error fetching variants:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения вариантов',
    });
  }
});

/**
 * GET /api/sdamgia/variant/:variantId
 * Получить конкретный вариант с заданиями
 */
router.get('/variant/:variantId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { variantId } = req.params;
    const { subject, examType } = req.query;

    if (!subject || !examType) {
      return res.status(400).json({
        success: false,
        message: 'Укажите предмет и тип экзамена',
      });
    }

    const sdamgiaSubject = SUBJECT_MAP[subject as string];

    if (!sdamgiaSubject) {
      return res.status(400).json({
        success: false,
        message: 'Неподдерживаемый предмет',
      });
    }

    // Python скрипт для получения варианта
    const pythonScript = `
import sys
sys.path.insert(0, "${process.cwd()}/sdamgia_api/src")
try:
    from sdamgia_api import SdamgiaClient, Subject, ExamType
    import json

    subject_enum = Subject.${sdamgiaSubject.toUpperCase()}
    exam_enum = ExamType.${(examType as string).toUpperCase()}

    with SdamgiaClient() as client:
        variant = client.get_variant("${variantId}", subject_enum, exam_enum)

        problems = []
        for idx, problem_ref in enumerate(variant.problems[:5]):  # Первые 5 для теста
            try:
                problem = client.get_problem(problem_ref.id, subject_enum, exam_enum)

                question_html = problem.condition.html if hasattr(problem.condition, 'html') else str(problem.condition)

                solution_html = None
                if problem.solution:
                    solution_html = problem.solution.html if hasattr(problem.solution, 'html') else str(problem.solution)

                problems.append({
                    'id': problem_ref.id,
                    'number': idx + 1,
                    'question': question_html,
                    'answer': str(problem.answer),
                    'solution': solution_html,
                    'topic': getattr(problem, 'topic', None)
                })
            except Exception as e:
                print(f"Warning: Failed to fetch problem {problem_ref.id}: {e}", file=sys.stderr)
                continue

        print(json.dumps({
            'success': True,
            'variant': {
                'id': "${variantId}",
                'problems': problems
            }
        }))
except Exception as e:
    import json
    import traceback
    print(json.dumps({'success': False, 'error': str(e), 'trace': traceback.format_exc()}))
`;

    const { stdout, stderr } = await execAsync(
      `python3 -c "${pythonScript.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`,
      { timeout: 60000 }
    );

    if (stderr && !stderr.includes('Warning')) {
      console.error('Python stderr:', stderr);
    }

    const result = JSON.parse(stdout.trim());

    if (!result.success) {
      console.error('Python error:', result.error);
      console.error('Trace:', result.trace);
      return res.status(500).json({
        success: false,
        message: result.error || 'Ошибка получения варианта',
      });
    }

    res.json({
      success: true,
      data: result.variant,
    });
  } catch (error: any) {
    console.error('Error fetching variant:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения варианта',
      error: error.message,
    });
  }
});

export default router;

import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import os from 'os';

const router = Router();
const execAsync = promisify(exec);

// Маппинг предметов (все доступные в sdamgia)
const SUBJECT_MAP: Record<string, string> = {
  MATHEMATICS: 'math',
  MATH_BASE: 'mathb',      // Математика базовая (ЕГЭ)
  RUSSIAN: 'rus',
  PHYSICS: 'phys',
  INFORMATICS: 'inf',
  BIOLOGY: 'bio',
  CHEMISTRY: 'chem',
  HISTORY: 'hist',
  ENGLISH: 'en',
  GEOGRAPHY: 'geo',
  SOCIAL_STUDIES: 'soc',   // Обществознание
  LITERATURE: 'lit',
  GERMAN: 'de',
  FRENCH: 'fr',
  SPANISH: 'sp',
};

// Маппинг типов экзаменов по классам
// 9 класс - ОГЭ, 11 класс - ЕГЭ
// 4-8, 10 классы - ВПР
const EXAM_TYPE_MAP: Record<number, string> = {
  4: 'vpr',
  5: 'vpr',
  6: 'vpr',
  7: 'vpr',
  8: 'vpr',
  9: 'oge',
  10: 'vpr',
  11: 'ege',
};

// Валидные типы экзаменов для sdamgia API
const VALID_EXAM_TYPES = ['oge', 'ege', 'vpr'];

// Предметы, доступные для ВПР по классам
const VPR_SUBJECTS_BY_GRADE: Record<number, string[]> = {
  4: ['math', 'rus'],
  5: ['math', 'rus', 'bio', 'hist'],
  6: ['math', 'rus', 'bio', 'hist', 'geo', 'soc'],
  7: ['math', 'rus', 'bio', 'hist', 'geo', 'soc', 'phys', 'en'],
  8: ['math', 'rus', 'bio', 'hist', 'geo', 'soc', 'phys', 'chem'],
  10: ['math', 'rus', 'bio', 'hist', 'geo', 'soc', 'phys', 'chem'],
  11: ['math', 'rus', 'bio', 'hist', 'geo', 'soc', 'phys', 'chem', 'en'],
};

// Количество заданий по предметам для ОГЭ
const OGE_TASK_COUNT: Record<string, number> = {
  math: 25,
  rus: 9,     // Изложение + сочинение + тест
  phys: 25,
  inf: 15,
  bio: 29,
  chem: 24,
  hist: 24,
  en: 15,     // Письменная часть
  geo: 30,
  soc: 24,
  lit: 5,
};

// Количество заданий по предметам для ЕГЭ
const EGE_TASK_COUNT: Record<string, number> = {
  math: 18,    // Профиль
  mathb: 21,   // База
  rus: 27,
  phys: 30,
  inf: 27,
  bio: 28,
  chem: 34,
  hist: 21,
  en: 40,
  geo: 31,
  soc: 25,
  lit: 12,
};

/**
 * GET /api/sdamgia/variants
 * Получить список вариантов для предмета и класса (реальные данные из sdamgia API)
 */
router.get('/variants', authenticateToken, async (req: AuthRequest, res: Response) => {
  let tempFile: string | null = null;

  try {
    const { subject, grade } = req.query;

    if (!subject || !grade) {
      return res.status(400).json({
        success: false,
        message: 'Укажите предмет и класс',
      });
    }

    const gradeNum = Number(grade);
    const sdamgiaSubject = SUBJECT_MAP[subject as string];
    const examType = EXAM_TYPE_MAP[gradeNum];

    if (!sdamgiaSubject) {
      return res.status(400).json({
        success: false,
        message: 'Неподдерживаемый предмет',
      });
    }

    if (!examType) {
      return res.status(400).json({
        success: false,
        message: `Для ${grade} класса sdamgia API не поддерживается`,
      });
    }

    // Проверка поддержки предмета для ВПР
    if (examType === 'vpr') {
      const availableSubjects = VPR_SUBJECTS_BY_GRADE[gradeNum] || [];
      if (!availableSubjects.includes(sdamgiaSubject)) {
        return res.status(400).json({
          success: false,
          message: `Предмет ${subject} не поддерживается для ВПР ${grade} класса`,
        });
      }
    }

    // Получаем реальные варианты из sdamgia API
    const sdamgiaPath = path.join(process.cwd(), 'sdamgia_api', 'src').replace(/\\/g, '/');

    // Для ВПР нужно передать grade в list_variants
    const gradeParam = examType === 'vpr' ? `, grade=${gradeNum}` : '';

    const pythonScript = `
import sys
import io
import json

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

sys.path.insert(0, "${sdamgiaPath}")

try:
    from sdamgia_api import SdamgiaClient, Subject, ExamType

    subject_enum = Subject.${sdamgiaSubject.toUpperCase()}
    exam_enum = ExamType.${examType.toUpperCase()}

    with SdamgiaClient() as client:
        variants = client.list_variants(subject_enum, exam_enum${gradeParam})
        result = []
        for i, v in enumerate(variants[:15]):  # Ограничиваем 15 вариантами
            result.append({
                'id': v.id,
                'number': i + 1,
                'title': v.title or f'Вариант {i + 1}',
                'subject': '${sdamgiaSubject}',
                'examType': '${examType}'
            })
        print(json.dumps({'success': True, 'data': result}, ensure_ascii=False))
except Exception as e:
    import traceback
    print(json.dumps({'success': False, 'error': str(e), 'trace': traceback.format_exc()}))
`;

    tempFile = path.join(os.tmpdir(), `sdamgia_variants_${Date.now()}.py`);
    await writeFile(tempFile, pythonScript);

    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const { stdout } = await execAsync(`${pythonCmd} "${tempFile}"`, {
      timeout: 60000,
    });

    const result = JSON.parse(stdout.trim());

    if (!result.success) {
      console.error('Python error:', result.error);
      console.error('Trace:', result.trace);
      return res.status(500).json({
        success: false,
        message: result.error || 'Ошибка получения вариантов',
      });
    }

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    console.error('Error fetching variants:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения вариантов',
    });
  } finally {
    if (tempFile) {
      try {
        await unlink(tempFile);
      } catch (err) {
        // Ignore
      }
    }
  }
});

/**
 * GET /api/sdamgia/variant/:variantId
 * Получить конкретный вариант с заданиями
 */
router.get('/variant/:variantId', authenticateToken, async (req: AuthRequest, res: Response) => {
  let tempFile: string | null = null;

  try {
    const { variantId } = req.params;
    const { subject, examType, grade } = req.query;

    if (!subject || !examType) {
      return res.status(400).json({
        success: false,
        message: 'Укажите предмет и тип экзамена',
      });
    }

    const sdamgiaSubject = SUBJECT_MAP[subject as string];
    const examTypeLower = (examType as string).toLowerCase();
    const gradeNum = grade ? Number(grade) : null;

    if (!sdamgiaSubject) {
      return res.status(400).json({
        success: false,
        message: 'Неподдерживаемый предмет',
      });
    }

    if (!VALID_EXAM_TYPES.includes(examTypeLower)) {
      return res.status(400).json({
        success: false,
        message: `Неподдерживаемый тип экзамена: ${examType}. Поддерживаются: OGE, EGE, VPR`,
      });
    }

    // Для ВПР обязателен grade
    if (examTypeLower === 'vpr' && !gradeNum) {
      return res.status(400).json({
        success: false,
        message: 'Для ВПР необходимо указать класс (grade)',
      });
    }

    // Создаем временный Python скрипт
    const sdamgiaPath = path.join(process.cwd(), 'sdamgia_api', 'src').replace(/\\/g, '/');

    // Для ВПР передаем grade
    const gradeParam = examTypeLower === 'vpr' ? `, grade=${gradeNum}` : '';

    const pythonScript = `
import sys
import io

# Исправление кодировки для Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

sys.path.insert(0, "${sdamgiaPath}")
try:
    from sdamgia_api import SdamgiaClient, Subject, ExamType
    import json

    subject_enum = Subject.${sdamgiaSubject.toUpperCase()}
    exam_enum = ExamType.${examTypeLower.toUpperCase()}

    with SdamgiaClient(timeout=60.0, rate_limit_rps=5.0) as client:
        variant = client.get_variant("${variantId}", subject_enum, exam_enum${gradeParam})

        problems = []
        for problem_ref in variant.problems:
            try:
                problem = client.get_problem(problem_ref.id, subject_enum, exam_enum${gradeParam})

                # Получаем HTML с условием задания
                question_html = problem.condition.html if hasattr(problem.condition, 'html') else str(problem.condition)

                # Получаем список изображений
                images = []
                if hasattr(problem.condition, 'images') and problem.condition.images:
                    images = problem.condition.images

                # Получаем решение
                solution_html = None
                solution_images = []
                if problem.solution:
                    solution_html = problem.solution.html if hasattr(problem.solution, 'html') else str(problem.solution)
                    if hasattr(problem.solution, 'images') and problem.solution.images:
                        solution_images = problem.solution.images

                # Определяем часть теста (1 или 2)
                task_number = problem_ref.number
                # Для ВПР обычно все задания в одной части
                part = 1 if task_number <= 19 else 2

                problems.append({
                    'id': problem_ref.id,
                    'number': task_number,
                    'part': part,
                    'question': question_html,
                    'images': images,
                    'answer': str(problem.answer) if problem.answer else '',
                    'solution': solution_html,
                    'solutionImages': solution_images,
                    'topic': problem.topic if hasattr(problem, 'topic') else None,
                    'score': problem.score if hasattr(problem, 'score') else 1
                })
            except Exception as e:
                print(f"Warning: Failed to fetch problem {problem_ref.id}: {e}", file=sys.stderr)
                continue

        # Сортируем по номеру задания
        problems.sort(key=lambda x: x['number'])

        print(json.dumps({
            'success': True,
            'variant': {
                'id': "${variantId}",
                'totalProblems': len(problems),
                'part1Count': len([p for p in problems if p['part'] == 1]),
                'part2Count': len([p for p in problems if p['part'] == 2]),
                'problems': problems
            }
        }, ensure_ascii=False))
except Exception as e:
    import json
    import traceback
    print(json.dumps({'success': False, 'error': str(e), 'trace': traceback.format_exc()}))
`;

    // Сохраняем во временный файл
    tempFile = path.join(os.tmpdir(), `sdamgia_${Date.now()}.py`);
    await writeFile(tempFile, pythonScript);

    // Выполняем Python скрипт (увеличен таймаут для загрузки всех заданий)
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const { stdout, stderr } = await execAsync(`${pythonCmd} "${tempFile}"`, {
      timeout: 300000, // 5 минут для загрузки всех заданий
      maxBuffer: 1024 * 1024 * 10, // 10MB буфер для большого JSON
    });

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
  } finally {
    // Удаляем временный файл
    if (tempFile) {
      try {
        await unlink(tempFile);
      } catch (err) {
        // Игнорируем ошибки удаления
      }
    }
  }
});

export default router;

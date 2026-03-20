import { execFile } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import os from 'os';
import path from 'path';
import { promisify } from 'util';

import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

import { authenticateToken } from '../middlewares/auth';
import { logger } from '../utils/logger';

import type { Request, Response } from 'express';

const router = Router();
const execFileAsync = promisify(execFile);

const sdamgiaLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Слишком много запросов, попробуйте позже' },
});

const SUBJECT_MAP: Record<string, string> = {
  MATHEMATICS: 'math',
  MATH_BASE: 'mathb',
  RUSSIAN: 'rus',
  PHYSICS: 'phys',
  INFORMATICS: 'inf',
  BIOLOGY: 'bio',
  CHEMISTRY: 'chem',
  HISTORY: 'hist',
  ENGLISH: 'en',
  GEOGRAPHY: 'geo',
  SOCIAL_STUDIES: 'soc',
  SOCIAL: 'soc',
  LITERATURE: 'lit',
  GERMAN: 'de',
  FRENCH: 'fr',
  SPANISH: 'sp',
};

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

const VALID_EXAM_TYPES = ['oge', 'ege', 'vpr'];

const VALID_SDAMGIA_SUBJECTS = new Set(Object.values(SUBJECT_MAP));
const VALID_GRADES = new Set(Object.keys(EXAM_TYPE_MAP).map(Number));

function sanitizeParam(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '');
}

function validateEnumValue(value: string, validSet: Set<string>, label: string): string {
  if (!validSet.has(value)) {
    throw new Error(`Invalid ${label}: ${sanitizeParam(value)}`);
  }
  return value;
}

const VPR_SUBJECTS_BY_GRADE: Record<number, string[]> = {
  4: ['math', 'rus'],
  5: ['math', 'rus', 'bio', 'hist'],
  6: ['math', 'rus', 'bio', 'hist', 'geo', 'soc', 'inf'],
  7: ['math', 'rus', 'bio', 'hist', 'geo', 'soc', 'phys', 'en', 'inf'],
  8: ['math', 'rus', 'bio', 'hist', 'geo', 'soc', 'phys', 'chem', 'inf', 'lit'],
  10: ['math', 'rus', 'bio', 'hist', 'geo', 'soc', 'phys', 'chem', 'lit'],
  11: ['math', 'rus', 'bio', 'hist', 'geo', 'soc', 'phys', 'chem', 'en'],
};

router.get('/variants', authenticateToken, sdamgiaLimiter, async (req: Request, res: Response) => {
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
    if (!Number.isInteger(gradeNum) || !VALID_GRADES.has(gradeNum)) {
      return res.status(400).json({
        success: false,
        message: `Для ${sanitizeParam(String(grade))} класса sdamgia API не поддерживается`,
      });
    }

    const sdamgiaSubject = SUBJECT_MAP[subject as string];
    const examType = EXAM_TYPE_MAP[gradeNum];

    if (!sdamgiaSubject || !VALID_SDAMGIA_SUBJECTS.has(sdamgiaSubject)) {
      return res.status(400).json({
        success: false,
        message: 'Неподдерживаемый предмет',
      });
    }

    if (!examType || !VALID_EXAM_TYPES.includes(examType)) {
      return res.status(400).json({
        success: false,
        message: `Для ${gradeNum} класса sdamgia API не поддерживается`,
      });
    }

    if (examType === 'vpr') {
      const availableSubjects = VPR_SUBJECTS_BY_GRADE[gradeNum] || [];
      if (!availableSubjects.includes(sdamgiaSubject)) {
        return res.status(400).json({
          success: false,
          message: `Предмет ${sanitizeParam(String(subject))} не поддерживается для ВПР ${gradeNum} класса`,
        });
      }
    }

    // Validate enum values strictly before interpolation into Python code
    validateEnumValue(sdamgiaSubject, VALID_SDAMGIA_SUBJECTS, 'subject');

    const sdamgiaPath = path.join(process.cwd(), '..', 'sdamgia_api', 'src').replace(/\\/g, '/');

    const gradeParam = examType === 'vpr' ? `, grade=${gradeNum}` : '';

    // Safe: sdamgiaSubject and examType are validated against whitelists,
    // gradeNum is validated as integer in VALID_GRADES set
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
        for i, v in enumerate(variants[:15]):
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
    const { stdout } = await execFileAsync(pythonCmd, [tempFile], {
      timeout: 60000,
    });

    const result = JSON.parse(stdout.trim());

    if (!result.success) {
      logger.error('Python error:', result.error);
      logger.error('Trace:', result.trace);
      return res.status(500).json({
        success: false,
        message: 'Ошибка получения вариантов',
      });
    }

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error: unknown) {
    logger.error('Error fetching variants:', error);
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

router.get('/variant/:variantId', authenticateToken, sdamgiaLimiter, async (req: Request, res: Response) => {
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

    // Sanitize variantId: only allow alphanumeric, hyphens, underscores
    const safeVariantId = sanitizeParam(String(variantId));
    if (!safeVariantId || safeVariantId.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Некорректный ID варианта',
      });
    }

    const sdamgiaSubject = SUBJECT_MAP[subject as string];
    const examTypeLower = (examType as string).toLowerCase();
    const gradeNum = grade ? Number(grade) : null;

    if (!sdamgiaSubject || !VALID_SDAMGIA_SUBJECTS.has(sdamgiaSubject)) {
      return res.status(400).json({
        success: false,
        message: 'Неподдерживаемый предмет',
      });
    }

    if (!VALID_EXAM_TYPES.includes(examTypeLower)) {
      return res.status(400).json({
        success: false,
        message: `Неподдерживаемый тип экзамена: ${sanitizeParam(String(examType))}. Поддерживаются: OGE, EGE, VPR`,
      });
    }

    if (examTypeLower === 'vpr' && (!gradeNum || !Number.isInteger(gradeNum) || !VALID_GRADES.has(gradeNum))) {
      return res.status(400).json({
        success: false,
        message: 'Для ВПР необходимо указать корректный класс (grade)',
      });
    }

    // Validate enum values strictly before interpolation into Python code
    validateEnumValue(sdamgiaSubject, VALID_SDAMGIA_SUBJECTS, 'subject');

    const sdamgiaPath = path.join(process.cwd(), '..', 'sdamgia_api', 'src').replace(/\\/g, '/');

    const gradeParam = examTypeLower === 'vpr' ? `, grade=${gradeNum}` : '';

    // Safe: sdamgiaSubject, examTypeLower are validated against whitelists,
    // safeVariantId is sanitized to alphanumeric only,
    // gradeNum is validated as integer in VALID_GRADES set
    const pythonScript = `
import sys
import io

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
        variant = client.get_variant("${safeVariantId}", subject_enum, exam_enum${gradeParam})

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

                # Получаем аудио
                audio_urls = []
                if hasattr(problem.condition, 'audio') and problem.condition.audio:
                    audio_urls = problem.condition.audio

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
                    'audio': audio_urls[0] if audio_urls else None,
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
                'id': "${safeVariantId}",
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

    tempFile = path.join(os.tmpdir(), `sdamgia_${Date.now()}.py`);
    await writeFile(tempFile, pythonScript);

    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const { stdout, stderr } = await execFileAsync(pythonCmd, [tempFile], {
      timeout: 300000,
      maxBuffer: 1024 * 1024 * 10,
    });

    if (stderr && !stderr.includes('Warning')) {
      logger.error('Python stderr:', stderr);
    }

    const result = JSON.parse(stdout.trim());

    if (!result.success) {
      logger.error('Python error:', result.error);
      logger.error('Trace:', result.trace);
      return res.status(500).json({
        success: false,
        message: 'Ошибка получения варианта',
      });
    }

    res.json({
      success: true,
      data: result.variant,
    });
  } catch (error) {
    logger.error('Error fetching variant:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения варианта',
    });
  } finally {
    if (tempFile) {
      try {
        await unlink(tempFile);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
});

export default router;

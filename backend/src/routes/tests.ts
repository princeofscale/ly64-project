import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { prisma } from '../config/database';
import antiCheatService from '../services/antiCheatService';
import { cacheService } from '../services/cacheService';
import { testSubmitRateLimitMiddleware } from '../middlewares/security';

const router = Router();

// Public endpoint - no auth required to list tests
// С кэшированием на 10 минут
router.get('/', async (req: Request, res: Response) => {
  console.log('📋 GET /tests request:', req.query);
  try {
    const { subject, examType, isDiagnostic } = req.query;

    // Генерируем ключ кэша
    const cacheKey = cacheService.generateKey('tests', {
      subject,
      examType,
      isDiagnostic,
    });

    // Проверяем кэш
    const cached = cacheService.get<{ success: boolean; data: unknown }>(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    const where: Record<string, unknown> = {};
    if (subject) where.subject = subject;
    if (examType) where.examType = examType;
    if (isDiagnostic !== undefined) where.isDiagnostic = isDiagnostic === 'true';

    const tests = await prisma.test.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        subject: true,
        examType: true,
        targetGrade: true,
        isDiagnostic: true,
        timeLimit: true,
        _count: { select: { questions: true } },
      },
    });

    const response = { success: true, data: tests };

    // Сохраняем в кэш на 10 минут
    cacheService.set(cacheKey, response, 10 * 60 * 1000);
    res.setHeader('X-Cache', 'MISS');

    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка получения тестов' });
  }
});

router.get('/:testId/start', authenticateToken, async (req: AuthRequest, res: Response) => {
  console.log('🚀 GET /tests/:testId/start request:', req.params.testId, 'user:', req.user?.id);
  try {
    const { testId } = req.params;

    const randomized = await antiCheatService.getRandomizedQuestions(testId);

    if (!randomized) {
      return res.status(404).json({ success: false, message: 'Тест не найден' });
    }

    res.json({ success: true, data: randomized });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка запуска теста' });
  }
});

router.post('/:testId/submit', authenticateToken, testSubmitRateLimitMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { testId } = req.params;
    const { answers, questionsOrder } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Укажите ответы' });
    }

    const result = await antiCheatService.submitTestWithAntiCheat(
      userId,
      testId,
      answers,
      questionsOrder || []
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Ошибка' });
  }
});

router.get('/:testId/results', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { testId } = req.params;

    const attempts = await prisma.testAttempt.findMany({
      where: { userId, testId },
      orderBy: { startedAt: 'desc' },
      select: {
        id: true,
        score: true,
        startedAt: true,
        completedAt: true,
        suspiciousFlag: true,
      },
    });

    res.json({ success: true, data: attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка получения результатов' });
  }
});

export default router;

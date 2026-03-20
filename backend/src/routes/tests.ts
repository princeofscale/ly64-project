import { Router } from 'express';

import prisma from '../config/database';
import { authenticateToken } from '../middlewares/auth';
import { testSubmitRateLimitMiddleware } from '../middlewares/security';
import achievementService from '../services/achievementService';
import antiCheatService from '../services/antiCheatService';
import { cacheService } from '../services/cacheService';
import { logger } from '../utils/logger';

import type { AuthRequest } from '../middlewares/auth';
import type { Response } from 'express';

const router = Router();

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { subject, examType, isDiagnostic } = req.query;

    const cacheKey = cacheService.generateKey('tests', {
      subject,
      examType,
      isDiagnostic,
    });

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

    cacheService.set(cacheKey, response, 10 * 60 * 1000);
    res.setHeader('X-Cache', 'MISS');

    res.json(response);
  } catch (error) {
    logger.error('Error fetching tests:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения тестов' });
  }
});

router.get('/:testId/start', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { testId } = req.params;

    if (!testId || Array.isArray(testId)) {
      return res.status(400).json({ success: false, message: 'Некорректный идентификатор теста' });
    }

    const randomized = await antiCheatService.getRandomizedQuestions(testId);

    if (!randomized) {
      return res.status(404).json({ success: false, message: 'Тест не найден' });
    }

    res.json({ success: true, data: randomized });
  } catch (error) {
    logger.error('Error starting test:', error);
    res.status(500).json({ success: false, message: 'Ошибка запуска теста' });
  }
});

router.post(
  '/:testId/submit',
  authenticateToken,
  testSubmitRateLimitMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });
      const { testId } = req.params;
      const { answers, questionsOrder } = req.body;

      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ success: false, message: 'Укажите ответы' });
      }

      if (!testId || Array.isArray(testId)) {
        return res
          .status(400)
          .json({ success: false, message: 'Некорректный идентификатор теста' });
      }

      const result = await antiCheatService.submitTestWithAntiCheat(
        userId,
        testId,
        answers,
        questionsOrder || []
      );

      achievementService.checkAndUnlockAchievements(userId).catch(err => {
        logger.error('Achievement check failed:', err);
      });

      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('Test submit error:', error);
      res.status(500).json({ success: false, message: 'Ошибка отправки теста' });
    }
  }
);

router.post(
  '/submit-result',
  authenticateToken,
  testSubmitRateLimitMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });
      const { subject, examType, score, totalQuestions, correctCount, title } = req.body;

      if (!subject || typeof subject !== 'string') {
        return res.status(400).json({ success: false, message: 'Укажите предмет (subject)' });
      }
      if (!examType || typeof examType !== 'string') {
        return res.status(400).json({ success: false, message: 'Укажите тип экзамена (examType)' });
      }
      if (score === undefined || typeof score !== 'number') {
        return res.status(400).json({ success: false, message: 'Укажите результат (score)' });
      }

      const safeScore = Math.min(100, Math.max(0, Math.round(score)));
      const safeTotalQuestions = (typeof totalQuestions === 'number' && Number.isInteger(totalQuestions) && totalQuestions >= 0) ? totalQuestions : 0;
      const safeCorrectCount = (typeof correctCount === 'number' && Number.isInteger(correctCount) && correctCount >= 0) ? Math.min(correctCount, safeTotalQuestions > 0 ? safeTotalQuestions : correctCount) : 0;
      const safeTitle = typeof title === 'string' ? title.slice(0, 200) : `Внешний тест - ${subject} (${examType})`;

      // Find or create a placeholder test for this subject+examType
      let test = await prisma.test.findFirst({
        where: { subject, examType, title: safeTitle },
      });

      if (!test) {
        test = await prisma.test.create({
          data: {
            title: safeTitle,
            subject,
            examType,
          },
        });
      }

      const attempt = await prisma.testAttempt.create({
        data: {
          userId,
          testId: test.id,
          score: safeScore,
          answers: JSON.stringify({ totalQuestions: safeTotalQuestions, correctCount: safeCorrectCount }),
          completedAt: new Date(),
        },
      });

      achievementService.checkAndUnlockAchievements(userId).catch(err => {
        logger.error('Achievement check failed:', err);
      });

      res.json({
        success: true,
        data: {
          attemptId: attempt.id,
          score: attempt.score,
          correctCount: safeCorrectCount,
          totalQuestions: safeTotalQuestions,
        },
      });
    } catch (error) {
      logger.error('External test submit error:', error);
      res.status(500).json({ success: false, message: 'Ошибка сохранения результата' });
    }
  }
);

router.get('/my-history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const { subject } = req.query;

    const whereClause: {
      userId: string;
      completedAt: { not: null };
      test?: { subject: string };
    } = {
      userId,
      completedAt: { not: null },
    };

    if (subject && typeof subject === 'string') {
      whereClause.test = { subject };
    }

    const attempts = await prisma.testAttempt.findMany({
      where: whereClause,
      orderBy: { completedAt: 'desc' },
      take: 200,
      select: {
        id: true,
        score: true,
        answers: true,
        completedAt: true,
        startedAt: true,
        test: {
          select: {
            title: true,
            subject: true,
            examType: true,
            targetGrade: true,
          },
        },
      },
    });

    const data = attempts.map(a => {
      let correctCount = 0;
      let totalQuestions = 0;
      try {
        const parsed = JSON.parse(a.answers) as unknown;
        if (Array.isArray(parsed)) {
          totalQuestions = parsed.length;
          const withIsCorrect = (parsed as { isCorrect?: boolean }[]).filter(
            ans => ans && typeof ans === 'object' && 'isCorrect' in ans
          );
          if (withIsCorrect.length > 0) {
            correctCount = withIsCorrect.filter(ans => ans.isCorrect).length;
          }
        } else if (parsed && typeof parsed === 'object') {
          const p = parsed as Record<string, unknown>;
          totalQuestions = typeof p['totalQuestions'] === 'number' ? p['totalQuestions'] : 0;
          correctCount = typeof p['correctCount'] === 'number' ? p['correctCount'] : 0;
        }
      } catch {
        // ignore malformed answers
      }

      return {
        id: a.id,
        score: a.score ?? 0,
        correctCount,
        totalQuestions,
        completedAt: a.completedAt,
        startedAt: a.startedAt,
        test: a.test,
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching test history:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения истории' });
  }
});

router.get('/:testId/results', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });
    const { testId } = req.params;

    if (Array.isArray(testId)) {
      return res.status(400).json({ success: false, message: 'Некорректный идентификатор теста' });
    }

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
    logger.error('Error fetching test results:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения результатов' });
  }
});

export default router;

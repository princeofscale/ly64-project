import { Router } from 'express';

import type { Request, Response } from 'express';

import prismaClient from '../config/database';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'API/ is running',
    dev: 'princeofscale',
    telegram: '@tqwit',
  });
});

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [usersCount, attemptsCount] = await Promise.all([
      prismaClient.user.count(),
      prismaClient.testAttempt.count({ where: { completedAt: { not: null } } }),
    ]);

    // Подсчитываем общее количество решённых задач
    const attempts = await prismaClient.testAttempt.findMany({
      where: { completedAt: { not: null } },
      select: { answers: true },
    });

    const totalSolvedQuestions = attempts.reduce((sum: number, attempt: { answers: string }) => {
      try {
        const answers = JSON.parse(attempt.answers || '[]');
        return sum + answers.filter((a: any) => a !== null && a !== undefined).length;
      } catch {
        return sum;
      }
    }, 0);

    res.json({
      success: true,
      data: {
        usersCount,
        completedTestsCount: attemptsCount,
        solvedQuestionsCount: totalSolvedQuestions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении статистики',
    });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { prisma } from '../config/database';
import antiCheatService from '../services/antiCheatService';

const router = Router();

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { subject, examType, isDiagnostic } = req.query;

    const where: any = {};
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

    res.json({ success: true, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка получения тестов' });
  }
});

router.get('/:testId/start', authenticateToken, async (req: AuthRequest, res: Response) => {
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

router.post('/:testId/submit', authenticateToken, async (req: AuthRequest, res: Response) => {
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

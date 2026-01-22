import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import diagnosticService from '../services/diagnosticService';

const router = Router();

router.get('/subjects', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const direction = req.query.direction as string | undefined;
    const subjects = diagnosticService.getSubjectsForUser(direction);
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка получения предметов' });
  }
});

router.get('/results', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const results = await diagnosticService.getUserDiagnosticResults(userId);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка получения результатов' });
  }
});

router.post('/submit', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { subject, score, details } = req.body;

    if (!subject || score === undefined) {
      return res.status(400).json({ success: false, message: 'Укажите предмет и баллы' });
    }

    const result = await diagnosticService.saveDiagnosticResult(
      userId,
      subject,
      score,
      details
    );

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка сохранения результата' });
  }
});

router.get('/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const direction = req.query.direction as string | undefined;
    const completed = await diagnosticService.checkDiagnosticCompleted(userId, direction);
    const results = await diagnosticService.getUserDiagnosticResults(userId);

    res.json({
      success: true,
      data: {
        completed,
        results,
        subjects: diagnosticService.getSubjectsForUser(direction),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка проверки статуса' });
  }
});

router.post('/plan/generate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { direction } = req.body;

    const plan = await diagnosticService.generateLearningPlan(userId, direction);
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка генерации плана' });
  }
});

router.get('/plan', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const plan = await diagnosticService.getLearningPlan(userId);

    if (!plan) {
      return res.status(404).json({ success: false, message: 'План не найден' });
    }

    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка получения плана' });
  }
});

router.post('/plan/complete-topic', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({ success: false, message: 'Укажите ID темы' });
    }

    const plan = await diagnosticService.markTopicCompleted(userId, itemId);
    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Ошибка' });
  }
});

export default router;

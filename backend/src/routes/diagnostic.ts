import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { requireDiagnosticCompleted } from '../middlewares/requireDiagnostic';
import diagnosticService from '../services/diagnosticService';

const router = Router();

router.get('/subjects', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const directionParam = req.query.direction as string | undefined;
    const direction = directionParam && directionParam !== '' ? directionParam : undefined;
    const grade = req.user?.currentGrade;
    const subjects = diagnosticService.getSubjectsForUser(direction, grade);
    res.json({ success: true, data: subjects });
  } catch (error) {
    console.error('Error in /diagnostic/subjects:', error);
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
    const directionParam = req.query.direction as string | undefined;
    const direction = directionParam && directionParam !== '' ? directionParam : undefined;
    const grade = req.user?.currentGrade;
    const completed = await diagnosticService.checkDiagnosticCompleted(userId, direction, grade);
    const results = await diagnosticService.getUserDiagnosticResults(userId);

    res.json({
      success: true,
      data: {
        completed,
        results,
        subjects: diagnosticService.getSubjectsForUser(direction, grade),
      },
    });
  } catch (error) {
    console.error('Error in /diagnostic/status:', error);
    res.status(500).json({ success: false, message: 'Ошибка проверки статуса' });
  }
});

router.get('/recommendations', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const recommendations = await diagnosticService.generateRecommendations(userId);

    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error('Error in /diagnostic/recommendations:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения рекомендаций' });
  }
});

router.post('/plan/generate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { direction } = req.body;
    const grade = req.user?.currentGrade;

    const plan = await diagnosticService.generateLearningPlan(userId, direction, grade);
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка генерации плана' });
  }
});

router.get('/plan', authenticateToken, requireDiagnosticCompleted, async (req: AuthRequest, res: Response) => {
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

router.post('/plan/complete-topic', authenticateToken, requireDiagnosticCompleted, async (req: AuthRequest, res: Response) => {
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

import { Router } from 'express';

import { authenticateToken } from '../middlewares/auth';
import marathonService from '../services/marathonService';
import { logger } from '../utils/logger';

import type { AuthRequest } from '../middlewares/auth';
import type { Response } from 'express';

const router = Router();

// Start a new marathon run
router.post('/start', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const { subject } = req.body;
    if (!subject || typeof subject !== 'string') {
      return res.status(400).json({ success: false, message: 'Укажите предмет (subject)' });
    }

    const result = await marathonService.startRun(userId, subject);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Marathon start error:', error);
    res.status(500).json({ success: false, message: 'Ошибка запуска марафона' });
  }
});

// Submit an answer for a marathon question
router.post('/:runId/answer', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const runId = req.params.runId as string;
    const { questionId, answer, answeredIds } = req.body;

    if (!questionId || typeof questionId !== 'string') {
      return res.status(400).json({ success: false, message: 'Укажите questionId' });
    }
    if (answer === undefined || answer === null) {
      return res.status(400).json({ success: false, message: 'Укажите ответ (answer)' });
    }

    const result = await marathonService.submitAnswer(
      runId,
      questionId,
      String(answer),
      Array.isArray(answeredIds) ? answeredIds : []
    );

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Marathon answer error:', error);
    const message = error instanceof Error ? error.message : 'Ошибка отправки ответа';
    res.status(500).json({ success: false, message });
  }
});

// End a marathon run manually
router.post('/:runId/end', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const runId = req.params.runId as string;
    const stats = await marathonService.endRun(runId);

    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Marathon end error:', error);
    const message = error instanceof Error ? error.message : 'Ошибка завершения марафона';
    res.status(500).json({ success: false, message });
  }
});

// Get leaderboard
router.get('/leaderboard', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { subject } = req.query;
    if (!subject || typeof subject !== 'string') {
      return res.status(400).json({ success: false, message: 'Укажите предмет (subject)' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const leaderboard = await marathonService.getLeaderboard(subject, Math.min(limit, 50));

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    logger.error('Marathon leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения рейтинга' });
  }
});

// Get user's best runs
router.get('/my-best', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const subject = req.query.subject as string | undefined;
    const bestRuns = await marathonService.getMyBest(userId, subject);

    res.json({ success: true, data: bestRuns });
  } catch (error) {
    logger.error('Marathon my-best error:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения лучших результатов' });
  }
});

export default router;

import { Router } from 'express';

import { authenticateToken } from '../middlewares/auth';
import { streakService } from '../services/streakService';
import { logger } from '../utils/logger';

import type { AuthRequest } from '../middlewares/auth';
import type { Response } from 'express';

const router = Router();

router.get('/streak', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });
    const streak = await streakService.getStreak(userId);

    res.json({
      success: true,
      data: streak,
    });
  } catch (error) {
    logger.error('Error fetching streak', { error });
    res.status(500).json({ success: false, message: 'Ошибка получения streak' });
  }
});

router.get('/daily-challenges', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });
    const challenges = await streakService.getDailyChallenges(userId);

    res.json({
      success: true,
      data: challenges,
    });
  } catch (error) {
    logger.error('Error fetching daily challenges', { error });
    res.status(500).json({ success: false, message: 'Ошибка получения заданий' });
  }
});

const ACTIVITY_POINTS: Record<string, number> = {
  test_completed: 10,
  high_score: 20,
  correct_streak: 15,
  time_spent: 5,
  theory_viewed: 5,
  challenge_completed: 0,
};

const VALID_ACTIVITY_TYPES = new Set(Object.keys(ACTIVITY_POINTS));

router.post('/activity', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });
    const { type, metadata } = req.body;

    if (!type || !VALID_ACTIVITY_TYPES.has(type)) {
      return res.status(400).json({ success: false, message: 'Некорректный тип активности' });
    }

    const points = ACTIVITY_POINTS[type] ?? 0;
    const result = await streakService.recordActivity(userId, type, points, metadata);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error recording activity', { error });
    res.status(500).json({ success: false, message: 'Ошибка записи активности' });
  }
});

router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });
    const days = Math.min(365, Math.max(1, parseInt(req.query.days as string) || 30));

    const [streak, challenges, stats] = await Promise.all([
      streakService.getStreak(userId),
      streakService.getDailyChallenges(userId),
      streakService.getActivityStats(userId, days),
    ]);

    res.json({
      success: true,
      data: {
        streak,
        dailyChallenges: challenges,
        stats,
      },
    });
  } catch (error) {
    logger.error('Error fetching gamification stats', { error });
    res.status(500).json({ success: false, message: 'Ошибка получения статистики' });
  }
});

router.get('/activity-history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });
    const days = Math.min(365, Math.max(1, parseInt(req.query.days as string) || 30));

    const stats = await streakService.getActivityStats(userId, days);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error fetching activity history', { error });
    res.status(500).json({ success: false, message: 'Ошибка получения истории' });
  }
});

export default router;

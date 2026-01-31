/**
 * Gamification Routes
 * API для streak, daily challenges, achievements
 */

import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { streakService } from '../services/streakService';
import { logger } from '../utils/logger';

const router = Router();

// ==========================================
// Streak Endpoints
// ==========================================

/**
 * GET /api/gamification/streak
 * Получить информацию о streak пользователя
 */
router.get('/streak', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
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

// ==========================================
// Daily Challenges Endpoints
// ==========================================

/**
 * GET /api/gamification/daily-challenges
 * Получить ежедневные задания
 */
router.get('/daily-challenges', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
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

// ==========================================
// Activity Endpoints
// ==========================================

/**
 * POST /api/gamification/activity
 * Записать активность пользователя
 */
router.post('/activity', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { type, points, metadata } = req.body;

    if (!type) {
      return res.status(400).json({ success: false, message: 'Укажите тип активности' });
    }

    const result = await streakService.recordActivity(userId, type, points || 0, metadata);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error recording activity', { error });
    res.status(500).json({ success: false, message: 'Ошибка записи активности' });
  }
});

/**
 * GET /api/gamification/stats
 * Получить статистику активности
 */
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const days = parseInt(req.query.days as string) || 30;

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

/**
 * GET /api/gamification/activity-history
 * Получить историю активности
 */
router.get('/activity-history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const days = parseInt(req.query.days as string) || 30;

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

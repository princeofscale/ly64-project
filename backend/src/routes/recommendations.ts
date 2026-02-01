import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { recommendationService } from '../services/recommendationService';
import { cacheService } from '../services/cacheService';
import { logger } from '../utils/logger';

const router = Router();

router.get('/analysis', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const cacheKey = `recommendations:analysis:${userId}`;
    const cached = cacheService.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const analysis = await recommendationService.analyzeUser(userId);

    cacheService.set(cacheKey, analysis, 5 * 60 * 1000);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    logger.error('Error getting user analysis', { error });
    res.status(500).json({ success: false, message: 'Ошибка анализа' });
  }
});

router.get('/weaknesses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const weaknesses = await recommendationService.getWeaknesses(userId);

    res.json({
      success: true,
      data: weaknesses,
    });
  } catch (error) {
    logger.error('Error getting weaknesses', { error });
    res.status(500).json({ success: false, message: 'Ошибка получения слабых мест' });
  }
});

router.get('/next', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 5;

    const recommendations = await recommendationService.getRecommendations(userId, limit);

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    logger.error('Error getting recommendations', { error });
    res.status(500).json({ success: false, message: 'Ошибка получения рекомендаций' });
  }
});

router.get('/tests', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await recommendationService.getRecommendedTests(userId);

    res.json({
      success: true,
      data: result.tests,
    });
  } catch (error) {
    logger.error('Error getting recommended tests', { error });
    res.status(500).json({ success: false, message: 'Ошибка получения тестов' });
  }
});

router.get('/topics', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const topics = await recommendationService.getTopicProgress(userId);

    res.json({
      success: true,
      data: topics,
    });
  } catch (error) {
    logger.error('Error getting topic progress', { error });
    res.status(500).json({ success: false, message: 'Ошибка получения прогресса' });
  }
});

export default router;

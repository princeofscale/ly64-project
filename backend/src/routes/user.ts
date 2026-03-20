import { Router } from 'express';

import {
  getProfile,
  getPublicProfile,
  updateProfile,
  updateAvatar,
  updatePrivacy,
  searchUsers,
  getStats,
  getAchievements,
  checkAchievements,
  getLeaderboard,
  getUserRank,
  getErrorAnalysis,
  changePassword,
} from '../controllers/userController';
import { authenticateToken } from '../middlewares/auth';
import prisma from '../config/database';
import errorAnalysisService from '../services/errorAnalysisService';
import { logger } from '../utils/logger';

import type { AuthRequest } from '../middlewares/auth';
import type { Response } from 'express';

const router = Router();

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/avatar', authenticateToken, updateAvatar);
router.put('/privacy', authenticateToken, updatePrivacy);
router.get('/stats', authenticateToken, getStats);
router.get('/achievements', authenticateToken, getAchievements);
router.post('/check-achievements', authenticateToken, checkAchievements);
router.get('/leaderboard', getLeaderboard);
router.get('/my-rank', authenticateToken, getUserRank);
router.get('/error-analysis', authenticateToken, getErrorAnalysis);
router.put('/change-password', authenticateToken, changePassword);

// Activity heatmap — returns daily activity counts for the last 365 days
router.get('/activity-heatmap', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const since = new Date();
    since.setFullYear(since.getFullYear() - 1);
    since.setHours(0, 0, 0, 0);

    const activities = await prisma.userActivity.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { createdAt: true, points: true },
    });

    // Group by date (YYYY-MM-DD)
    const byDate = new Map<string, { count: number; points: number }>();
    for (const a of activities) {
      const key = a.createdAt.toISOString().slice(0, 10);
      const existing = byDate.get(key);
      if (existing) {
        existing.count += 1;
        existing.points += a.points;
      } else {
        byDate.set(key, { count: 1, points: a.points });
      }
    }

    const data = Array.from(byDate.entries()).map(([date, val]) => ({
      date,
      count: val.count,
      points: val.points,
    }));

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Activity heatmap error:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения активности' });
  }
});

// Save topic practice result
router.post('/practice-result', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const { subject, topicId, correct, total } = req.body as {
      subject: string;
      topicId: string;
      correct: number;
      total: number;
    };

    if (!subject || !topicId || typeof correct !== 'number' || typeof total !== 'number' || total <= 0) {
      return res.status(400).json({ success: false, message: 'Неверные параметры' });
    }

    await prisma.userActivity.create({
      data: {
        userId,
        type: 'topic_practice',
        points: correct,
        metadata: JSON.stringify({ subject, topicId, correct, total }),
      },
    });

    res.json({ success: true });
  } catch (error) {
    logger.error('Practice result save error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сохранения результата' });
  }
});

// Knowledge Map endpoint - aggregates topic mastery data
router.get('/knowledge-map', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const analysis = await errorAnalysisService.getDetailedAnalysis(userId);

    // Convert topic data into knowledge map format
    interface TopicNode {
      id: string;
      title: string;
      accuracy: number;
      total: number;
      status: 'mastered' | 'learning' | 'weak' | 'untouched';
      subject: string;
    }

    const topicMap = new Map<string, TopicNode>();

    // Process weak topics from error analysis
    if (analysis.weakTopics) {
      for (const topic of analysis.weakTopics) {
        const accuracy = topic.total > 0 ? Math.round((topic.correct / topic.total) * 100) : 0;
        topicMap.set(topic.topic, {
          id: topic.topic,
          title: topic.topic,
          accuracy,
          total: topic.total,
          status: accuracy < 40 ? 'weak' : 'learning',
          subject: topic.subject || '',
        });
      }
    }

    // Process strong topics from error analysis
    if (analysis.strongTopics) {
      for (const topic of analysis.strongTopics) {
        if (!topicMap.has(topic.topic)) {
          topicMap.set(topic.topic, {
            id: topic.topic,
            title: topic.topic,
            accuracy: Math.round(topic.accuracy),
            total: topic.total,
            status: topic.accuracy >= 80 ? 'mastered' : 'learning',
            subject: topic.subject || '',
          });
        }
      }
    }

    // Merge topic practice results from UserActivity
    const practiceActivities = await prisma.userActivity.findMany({
      where: { userId, type: 'topic_practice' },
    });

    // Aggregate practice data per topicId
    const practiceAgg = new Map<string, { correct: number; total: number; subject: string }>();
    for (const activity of practiceActivities) {
      if (!activity.metadata) continue;
      try {
        const meta = JSON.parse(activity.metadata) as { subject: string; topicId: string; correct: number; total: number };
        const existing = practiceAgg.get(meta.topicId);
        if (existing) {
          existing.correct += meta.correct;
          existing.total += meta.total;
        } else {
          practiceAgg.set(meta.topicId, { correct: meta.correct, total: meta.total, subject: meta.subject });
        }
      } catch {
        // skip malformed metadata
      }
    }

    // Merge practice data into topic map
    for (const [topicId, agg] of practiceAgg) {
      const existing = topicMap.get(topicId);
      if (existing) {
        // Combine exam + practice data
        const combinedCorrect = (existing.accuracy / 100) * existing.total + agg.correct;
        const combinedTotal = existing.total + agg.total;
        const combinedAccuracy = combinedTotal > 0 ? Math.round((combinedCorrect / combinedTotal) * 100) : 0;
        existing.accuracy = combinedAccuracy;
        existing.total = combinedTotal;
        existing.status = combinedAccuracy >= 80 ? 'mastered' : combinedAccuracy < 40 ? 'weak' : 'learning';
      } else {
        const accuracy = agg.total > 0 ? Math.round((agg.correct / agg.total) * 100) : 0;
        topicMap.set(topicId, {
          id: topicId,
          title: topicId,
          accuracy,
          total: agg.total,
          status: accuracy >= 80 ? 'mastered' : accuracy < 40 ? 'weak' : 'learning',
          subject: agg.subject,
        });
      }
    }

    const topics = Array.from(topicMap.values());
    res.json({ success: true, data: { topics } });
  } catch (error) {
    logger.error('Knowledge map error:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения карты знаний' });
  }
});

router.get('/search', authenticateToken, searchUsers);
router.get('/:username', getPublicProfile);

export default router;

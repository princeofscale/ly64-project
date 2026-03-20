import { Router } from 'express';

import { authenticateToken } from '../middlewares/auth';
import bookmarkService from '../services/bookmarkService';
import { logger } from '../utils/logger';

import type { AuthRequest } from '../middlewares/auth';
import type { Response } from 'express';

const router = Router();

// Toggle bookmark
router.post('/:questionId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const questionId = req.params.questionId as string;
    const { note } = req.body as { note?: string };

    const result = await bookmarkService.toggle(userId, questionId, note);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Bookmark toggle error:', error);
    res.status(500).json({ success: false, message: 'Ошибка при переключении закладки' });
  }
});

// Get all bookmarks
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const subject = req.query.subject as string | undefined;
    const bookmarks = await bookmarkService.getAll(userId, subject);
    res.json({ success: true, data: bookmarks });
  } catch (error) {
    logger.error('Get bookmarks error:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения закладок' });
  }
});

// Check if bookmarked
router.get('/check/:questionId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const questionId = req.params.questionId as string;
    const bookmarked = await bookmarkService.isBookmarked(userId, questionId);
    res.json({ success: true, data: { bookmarked } });
  } catch (error) {
    logger.error('Check bookmark error:', error);
    res.status(500).json({ success: false, message: 'Ошибка проверки закладки' });
  }
});

// Remove bookmark
router.delete('/:questionId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const questionId = req.params.questionId as string;
    await bookmarkService.remove(userId, questionId);
    res.json({ success: true, data: { bookmarked: false } });
  } catch (error) {
    logger.error('Remove bookmark error:', error);
    res.status(500).json({ success: false, message: 'Ошибка удаления закладки' });
  }
});

export default router;

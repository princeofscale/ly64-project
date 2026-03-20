import { Router } from 'express';

import { authenticateToken } from '../middlewares/auth';
import commentService from '../services/commentService';
import { logger } from '../utils/logger';

import type { AuthRequest } from '../middlewares/auth';
import type { Response } from 'express';

const router = Router();

// Get comments for a question
router.get('/:questionId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || null;
    const questionId = req.params.questionId as string;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10), 50) : 20;

    const result = await commentService.getComments(questionId, userId, page, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Get comments error:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения комментариев' });
  }
});

// Add a comment
router.post('/:questionId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const questionId = req.params.questionId as string;
    const { content, parentId } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ success: false, message: 'Укажите текст комментария' });
    }

    const comment = await commentService.addComment(questionId, userId, content, parentId);
    res.json({ success: true, data: comment });
  } catch (error) {
    logger.error('Add comment error:', error);
    const message = error instanceof Error ? error.message : 'Ошибка добавления комментария';
    res.status(400).json({ success: false, message });
  }
});

// Delete a comment (soft)
router.delete('/:commentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const commentId = req.params.commentId as string;
    await commentService.deleteComment(commentId, userId);
    res.json({ success: true });
  } catch (error) {
    logger.error('Delete comment error:', error);
    const message = error instanceof Error ? error.message : 'Ошибка удаления комментария';
    res.status(400).json({ success: false, message });
  }
});

// Toggle like on a comment
router.post('/:commentId/like', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const commentId = req.params.commentId as string;
    const result = await commentService.toggleLike(commentId, userId);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Toggle like error:', error);
    const message = error instanceof Error ? error.message : 'Ошибка';
    res.status(400).json({ success: false, message });
  }
});

export default router;

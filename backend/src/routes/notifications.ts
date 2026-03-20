import { Router } from 'express';

import { authenticateToken } from '../middlewares/auth';
import notificationService from '../services/notificationService';
import { logger } from '../utils/logger';

import type { AuthRequest } from '../middlewares/auth';
import type { Response } from 'express';

const router = Router();

// Get notifications (paginated)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const offset = parseInt(req.query.offset as string) || 0;

    const notifications = await notificationService.getAll(userId, limit, offset);
    res.json({ success: true, data: notifications });
  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения уведомлений' });
  }
});

// Get unread count
router.get('/unread-count', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const count = await notificationService.getUnreadCount(userId);
    res.json({ success: true, data: { count } });
  } catch (error) {
    logger.error('Get unread count error:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения количества уведомлений' });
  }
});

// Mark one as read
router.patch('/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    await notificationService.markAsRead(userId, req.params.id as string);
    res.json({ success: true });
  } catch (error) {
    logger.error('Mark notification read error:', error);
    res.status(500).json({ success: false, message: 'Ошибка' });
  }
});

// Mark all as read
router.patch('/read-all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    await notificationService.markAllAsRead(userId);
    res.json({ success: true });
  } catch (error) {
    logger.error('Mark all notifications read error:', error);
    res.status(500).json({ success: false, message: 'Ошибка' });
  }
});

export default router;

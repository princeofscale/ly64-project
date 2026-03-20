import { Router } from 'express';

import { authenticateToken } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/requireAdmin';
import ticketService from '../services/ticketService';
import { logger } from '../utils/logger';

import type { AuthRequest } from '../middlewares/auth';
import type { Response } from 'express';

const router = Router();

// ─── User routes ─────────────────────────────────────────────────────────────

// GET /api/support/tickets — my tickets
router.get('/tickets', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const tickets = await ticketService.getUserTickets(userId);
    res.json({ success: true, data: tickets });
  } catch (error) {
    logger.error('GET /support/tickets error:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения тикетов' });
  }
});

// POST /api/support/tickets — create ticket
router.post('/tickets', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const { title, category, message } = req.body as {
      title?: string;
      category?: string;
      message?: string;
    };

    if (!title || !category || !message) {
      return res.status(400).json({ success: false, message: 'Укажите тему, категорию и сообщение' });
    }

    const ticket = await ticketService.createTicket(userId, title, category, message);
    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    logger.error('POST /support/tickets error:', error);
    res.status(500).json({ success: false, message: 'Ошибка создания тикета' });
  }
});

// GET /api/support/tickets/:id
router.get('/tickets/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const ticket = await ticketService.getTicketById(req.params.id as string, userId);
    res.json({ success: true, data: ticket });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ошибка';
    const status = message === 'Нет доступа' ? 403 : message === 'Тикет не найден' ? 404 : 500;
    res.status(status).json({ success: false, message });
  }
});

// POST /api/support/tickets/:id/messages — user sends message
router.post('/tickets/:id/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const { body } = req.body as { body?: string };
    if (!body) return res.status(400).json({ success: false, message: 'Введите сообщение' });

    // Verify ownership before adding message
    await ticketService.getTicketById(req.params.id as string, userId);

    const msg = await ticketService.addMessage(req.params.id as string, userId, body, false);
    res.status(201).json({ success: true, data: msg });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ошибка';
    const status = message === 'Нет доступа' ? 403 : message === 'Тикет не найден' ? 404 : 500;
    res.status(status).json({ success: false, message });
  }
});

// PATCH /api/support/tickets/:id/close
router.patch('/tickets/:id/close', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    // Verify ownership
    await ticketService.getTicketById(req.params.id as string, userId);

    const ticket = await ticketService.updateStatus(req.params.id as string, 'CLOSED');
    res.json({ success: true, data: ticket });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ошибка';
    const status = message === 'Нет доступа' ? 403 : message === 'Тикет не найден' ? 404 : 500;
    res.status(status).json({ success: false, message });
  }
});

// ─── Admin routes ─────────────────────────────────────────────────────────────

// GET /api/support/admin/tickets
router.get('/admin/tickets', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status, category, priority } = req.query as {
      status?: string;
      category?: string;
      priority?: string;
    };
    const tickets = await ticketService.getAllTickets({ status, category, priority });
    res.json({ success: true, data: tickets });
  } catch (error) {
    logger.error('GET /support/admin/tickets error:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения тикетов' });
  }
});

// GET /api/support/admin/stats
router.get('/admin/stats', authenticateToken, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const stats = await ticketService.getAdminStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('GET /support/admin/stats error:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения статистики' });
  }
});

// GET /api/support/admin/tickets/:id
router.get('/admin/tickets/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id as string);
    res.json({ success: true, data: ticket });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ошибка';
    const status = message === 'Тикет не найден' ? 404 : 500;
    res.status(status).json({ success: false, message });
  }
});

// POST /api/support/admin/tickets/:id/messages — admin reply
router.post('/admin/tickets/:id/messages', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const { body } = req.body as { body?: string };
    if (!body) return res.status(400).json({ success: false, message: 'Введите сообщение' });

    const msg = await ticketService.addMessage(req.params.id as string, userId, body, true);
    res.status(201).json({ success: true, data: msg });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ошибка';
    const status = message === 'Тикет не найден' ? 404 : 500;
    res.status(status).json({ success: false, message });
  }
});

// PATCH /api/support/admin/tickets/:id/status
router.patch('/admin/tickets/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body as { status?: string };
    if (!status) return res.status(400).json({ success: false, message: 'Укажите статус' });

    const ticket = await ticketService.updateStatus(req.params.id as string, status);
    res.json({ success: true, data: ticket });
  } catch (error) {
    logger.error('PATCH /support/admin/tickets/:id/status error:', error);
    res.status(500).json({ success: false, message: 'Ошибка обновления статуса' });
  }
});

// PATCH /api/support/admin/tickets/:id/priority
router.patch('/admin/tickets/:id/priority', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { priority } = req.body as { priority?: string };
    if (!priority) return res.status(400).json({ success: false, message: 'Укажите приоритет' });

    const ticket = await ticketService.updatePriority(req.params.id as string, priority);
    res.json({ success: true, data: ticket });
  } catch (error) {
    logger.error('PATCH /support/admin/tickets/:id/priority error:', error);
    res.status(500).json({ success: false, message: 'Ошибка обновления приоритета' });
  }
});

// PATCH /api/support/admin/tickets/:id/assign
router.patch('/admin/tickets/:id/assign', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const ticket = await ticketService.assign(req.params.id as string, userId);
    res.json({ success: true, data: ticket });
  } catch (error) {
    logger.error('PATCH /support/admin/tickets/:id/assign error:', error);
    res.status(500).json({ success: false, message: 'Ошибка назначения тикета' });
  }
});

export default router;

import { Router } from 'express';

import { authenticateToken } from '../middlewares/auth';
import duelService from '../services/duelService';
import { logger } from '../utils/logger';

import type { AuthRequest } from '../middlewares/auth';
import type { Response } from 'express';

const router = Router();

// Create a new duel room
router.post('/create', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const { subject, questionsCount, timePerQuestion } = req.body;
    if (!subject || typeof subject !== 'string') {
      return res.status(400).json({ success: false, message: 'Укажите предмет' });
    }

    const result = await duelService.createDuel(userId, subject, questionsCount, timePerQuestion);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Duel create error:', error);
    res.status(500).json({ success: false, message: 'Ошибка создания дуэли' });
  }
});

// Join a duel by code
router.post('/join/:code', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const code = req.params.code as string;
    const result = await duelService.joinByCode(userId, code);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Duel join error:', error);
    const message = error instanceof Error ? error.message : 'Ошибка присоединения к дуэли';
    res.status(400).json({ success: false, message });
  }
});

// Find a random match
router.post('/find-match', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const { subject } = req.body;
    if (!subject || typeof subject !== 'string') {
      return res.status(400).json({ success: false, message: 'Укажите предмет' });
    }

    const result = await duelService.findRandomOpponent(userId, subject);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Duel find-match error:', error);
    res.status(500).json({ success: false, message: 'Ошибка поиска соперника' });
  }
});

// Get duel info
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const duel = await duelService.getDuel(id);
    if (!duel) return res.status(404).json({ success: false, message: 'Дуэль не найдена' });
    res.json({ success: true, data: duel });
  } catch (error) {
    logger.error('Duel get error:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения дуэли' });
  }
});

// Start a duel (when both players are ready)
router.post('/:id/start', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await duelService.startDuel(id);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Duel start error:', error);
    const message = error instanceof Error ? error.message : 'Ошибка запуска дуэли';
    res.status(400).json({ success: false, message });
  }
});

// Submit an answer in a duel
router.post('/:id/answer', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const id = req.params.id as string;
    const { questionId, answer, timeMs } = req.body;

    if (!questionId || answer === undefined) {
      return res.status(400).json({ success: false, message: 'Укажите questionId и answer' });
    }

    const result = await duelService.submitDuelAnswer(
      id,
      userId,
      questionId,
      String(answer),
      typeof timeMs === 'number' ? timeMs : 30000
    );

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Duel answer error:', error);
    const message = error instanceof Error ? error.message : 'Ошибка отправки ответа';
    res.status(400).json({ success: false, message });
  }
});

// Get duel history
router.get('/history/my', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const history = await duelService.getDuelHistory(userId);
    res.json({ success: true, data: history });
  } catch (error) {
    logger.error('Duel history error:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения истории дуэлей' });
  }
});

export default router;

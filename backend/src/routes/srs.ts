import { Router } from 'express';

import { authenticateToken } from '../middlewares/auth';
import srsService from '../services/srsService';
import { logger } from '../utils/logger';

import type { AuthRequest } from '../middlewares/auth';
import type { Response } from 'express';

const router = Router();

// Add a card
router.post('/cards', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const { questionId, flashcardId, front, back, subject } = req.body;
    if (!front || !back || !subject) {
      return res.status(400).json({ success: false, message: 'front, back и subject обязательны' });
    }

    const result = await srsService.addCard(userId, { questionId, flashcardId, front, back, subject });
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('SRS add card error:', error);
    res.status(500).json({ success: false, message: 'Ошибка добавления карточки' });
  }
});

// Get due cards
router.get('/due', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const subject = req.query.subject as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    const cards = await srsService.getDueCards(userId, subject, limit);
    res.json({ success: true, data: cards });
  } catch (error) {
    logger.error('SRS get due cards error:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения карточек' });
  }
});

// Review a card
router.post('/review/:cardId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const cardId = req.params.cardId as string;
    const { quality } = req.body;

    if (quality === undefined || typeof quality !== 'number' || quality < 0 || quality > 5) {
      return res.status(400).json({ success: false, message: 'quality должно быть числом от 0 до 5' });
    }

    await srsService.reviewCard(cardId, userId, quality);
    res.json({ success: true });
  } catch (error) {
    logger.error('SRS review card error:', error);
    res.status(500).json({ success: false, message: 'Ошибка обзора карточки' });
  }
});

// Get stats
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const stats = await srsService.getStats(userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('SRS stats error:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения статистики' });
  }
});

// Import wrong answers from test attempt
router.post('/import-mistakes/:attemptId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const attemptId = req.params.attemptId as string;
    const result = await srsService.addFromWrongAnswers(userId, attemptId);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('SRS import mistakes error:', error);
    res.status(500).json({ success: false, message: 'Ошибка импорта ошибок' });
  }
});

export default router;

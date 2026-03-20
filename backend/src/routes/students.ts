import { Router } from 'express';

import { authenticateToken } from '../middlewares/auth';
import studentsService from '../services/studentsService';
import { logger } from '../utils/logger';

import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth';

const router = Router();

router.get('/', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    const students = await studentsService.getStudents();
    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    logger.error('Error getting students:', error);
    res.status(500).json({
      success: false,
      message: 'Не удалось получить список учащихся',
      data: [],
    });
  }
});

export default router;

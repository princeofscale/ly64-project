import { Router, Request, Response } from 'express';
import studentsService from '../services/studentsService';

const router = Router();


router.get('/', async (_req: Request, res: Response) => {
  try {
    const students = await studentsService.getStudents();
    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error('Error getting students:', error);
    res.status(500).json({
      success: false,
      message: 'Не удалось получить список учащихся',
      data: [],
    });
  }
});

export default router;

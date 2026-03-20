import { Router } from 'express';

import prisma from '../config/database';
import { authenticateToken } from '../middlewares/auth';
import classroomService from '../services/classroomService';
import { logger } from '../utils/logger';

import type { AuthRequest } from '../middlewares/auth';
import type { Response } from 'express';

const router = Router();

// Create classroom (teacher/admin only)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
      return res.status(403).json({ success: false, message: 'Только учителя могут создавать классы' });
    }

    const { name } = req.body as { name: string };
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Укажите название класса' });
    }

    const classroom = await classroomService.createClassroom(userId, name.trim());
    res.json({ success: true, data: classroom });
  } catch (error) {
    logger.error('Create classroom error:', error);
    res.status(500).json({ success: false, message: 'Ошибка создания класса' });
  }
});

// Join classroom by code
router.post('/join', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const { code } = req.body as { code: string };
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'Укажите код класса' });
    }

    const classroom = await classroomService.joinByCode(userId, code.trim().toUpperCase());
    res.json({ success: true, data: classroom });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ошибка присоединения к классу';
    logger.error('Join classroom error:', error);
    res.status(400).json({ success: false, message });
  }
});

// Get my classrooms
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const role = req.query.role as string | undefined;
    let classrooms;

    if (role === 'teacher') {
      classrooms = await classroomService.getTeacherClassrooms(userId);
    } else if (role === 'student') {
      classrooms = await classroomService.getStudentClassrooms(userId);
    } else {
      // Auto-detect: return both
      const [teacherClassrooms, studentClassrooms] = await Promise.all([
        classroomService.getTeacherClassrooms(userId),
        classroomService.getStudentClassrooms(userId),
      ]);
      classrooms = { teacher: teacherClassrooms, student: studentClassrooms };
    }

    res.json({ success: true, data: classrooms });
  } catch (error) {
    logger.error('Get classrooms error:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения классов' });
  }
});

// Get classroom students with stats
router.get('/:id/students', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const classroomId = req.params.id as string;
    const students = await classroomService.getClassroomStudents(classroomId);
    res.json({ success: true, data: students });
  } catch (error) {
    logger.error('Get classroom students error:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения учеников' });
  }
});

// Get classroom stats
router.get('/:id/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const classroomId = req.params.id as string;
    const stats = await classroomService.getClassroomStats(classroomId);
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Get classroom stats error:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения статистики' });
  }
});

// Delete classroom (teacher/admin only)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Не авторизован' });

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
      return res.status(403).json({ success: false, message: 'Нет прав для удаления' });
    }

    const classroomId = req.params.id as string;
    await classroomService.deleteClassroom(classroomId, userId);
    res.json({ success: true, message: 'Класс удалён' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ошибка удаления класса';
    logger.error('Delete classroom error:', error);
    res.status(400).json({ success: false, message });
  }
});

export default router;

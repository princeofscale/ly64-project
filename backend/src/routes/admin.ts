import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/requireAdmin';
import prisma from '../config/database';

const router = Router();

// Получить всех пользователей
router.get('/users', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { search, role, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search as string } },
        { name: { contains: search as string } },
        { username: { contains: search as string } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          role: true,
          status: true,
          currentGrade: true,
          desiredDirection: true,
          diagnosticCompleted: true,
          createdAt: true,
          _count: {
            select: {
              testAttempts: true,
              diagnosticResults: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения пользователей' });
  }
});

// Получить одного пользователя
router.get('/users/:userId', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        status: true,
        currentGrade: true,
        desiredDirection: true,
        motivation: true,
        diagnosticCompleted: true,
        createdAt: true,
        updatedAt: true,
        diagnosticResults: true,
        testAttempts: {
          orderBy: { startedAt: 'desc' },
          take: 10,
          include: {
            test: {
              select: { title: true, subject: true },
            },
          },
        },
        learningPlan: {
          include: { items: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения пользователя' });
  }
});

// Обновить пользователя
router.put('/users/:userId', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { role, diagnosticCompleted, status, currentGrade, desiredDirection } = req.body;

    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (diagnosticCompleted !== undefined) updateData.diagnosticCompleted = diagnosticCompleted;
    if (status !== undefined) updateData.status = status;
    if (currentGrade !== undefined) updateData.currentGrade = currentGrade;
    if (desiredDirection !== undefined) updateData.desiredDirection = desiredDirection;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        status: true,
        currentGrade: true,
        desiredDirection: true,
        diagnosticCompleted: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Ошибка обновления пользователя' });
  }
});

// Удалить пользователя
router.delete('/users/:userId', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const adminId = req.user!.id;

    // Нельзя удалить самого себя
    if (userId === adminId) {
      return res.status(400).json({ success: false, message: 'Нельзя удалить свой аккаунт' });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ success: true, message: 'Пользователь удалён' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Ошибка удаления пользователя' });
  }
});

// Сбросить диагностику пользователя
router.post('/users/:userId/reset-diagnostic', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Удаляем результаты диагностики
    await prisma.diagnosticResult.deleteMany({
      where: { userId },
    });

    // Сбрасываем флаг
    await prisma.user.update({
      where: { id: userId },
      data: { diagnosticCompleted: false },
    });

    res.json({ success: true, message: 'Диагностика сброшена' });
  } catch (error) {
    console.error('Error resetting diagnostic:', error);
    res.status(500).json({ success: false, message: 'Ошибка сброса диагностики' });
  }
});

// Статистика платформы
router.get('/stats', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      usersToday,
      totalTests,
      testsToday,
      diagnosticCompleted,
      usersByRole,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.testAttempt.count(),
      prisma.testAttempt.count({
        where: {
          startedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.user.count({ where: { diagnosticCompleted: true } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        usersToday,
        totalTests,
        testsToday,
        diagnosticCompleted,
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item.role] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения статистики' });
  }
});

export default router;

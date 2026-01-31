import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/requireAdmin';
import { adminLimiter } from '../middlewares/security';
import { logAdminAction } from '../utils/logger';
import prisma from '../config/database';
import { z } from 'zod';
import { cacheService, invalidateCache } from '../services/cacheService';

const router = Router();

// Apply admin rate limiter to all admin routes
router.use(adminLimiter);

// Validation schema for user updates
const updateUserSchema = z.object({
  role: z.enum(['USER', 'ADMIN']).optional(),
  diagnosticCompleted: z.boolean().optional(),
  status: z.enum(['pending', 'active', 'inactive']).optional(),
  currentGrade: z.number().min(8).max(11).optional(),
  desiredDirection: z.enum(['math', 'physics', 'it', 'chemistry', 'biology']).optional(),
}).strict(); // Strict mode - reject unknown fields

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

    // Validate input to prevent arbitrary field injection
    const validationResult = updateUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Некорректные данные',
        errors: validationResult.error.errors,
      });
    }

    const updateData = validationResult.data;

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Нет данных для обновления',
      });
    }

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

    // Log admin action
    logAdminAction(req.user!.id, 'UPDATE_USER', userId, req, updateData);

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

    // Log admin action
    logAdminAction(req.user!.id, 'DELETE_USER', userId, req);

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

    // Log admin action
    logAdminAction(req.user!.id, 'RESET_DIAGNOSTIC', userId, req);

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

// ==========================================
// Cache Management
// ==========================================

// Получить статистику кэша
router.get('/cache/stats', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const stats = cacheService.getStats();
    const hitRate = cacheService.getHitRate();

    res.json({
      success: true,
      data: {
        ...stats,
        hitRate: `${hitRate}%`,
      },
    });
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения статистики кэша' });
  }
});

// Очистить кэш по префиксу
router.delete('/cache/:prefix', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { prefix } = req.params;
    const deleted = invalidateCache(prefix);

    logAdminAction(req.user!.id, 'CLEAR_CACHE', undefined, req, { prefix, deleted });

    res.json({
      success: true,
      message: `Удалено ${deleted} записей кэша с префиксом "${prefix}"`,
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ success: false, message: 'Ошибка очистки кэша' });
  }
});

// Очистить весь кэш
router.delete('/cache', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    cacheService.clear();

    logAdminAction(req.user!.id, 'CLEAR_ALL_CACHE', undefined, req);

    res.json({
      success: true,
      message: 'Весь кэш очищен',
    });
  } catch (error) {
    console.error('Error clearing all cache:', error);
    res.status(500).json({ success: false, message: 'Ошибка очистки кэша' });
  }
});

export default router;

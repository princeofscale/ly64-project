import { Router } from 'express';
import { z } from 'zod';

import prisma from '../config/database';
import { authenticateToken } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/requireAdmin';
import { adminLimiter } from '../middlewares/security';
import { cacheService, invalidateCache } from '../services/cacheService';
import { logger, logAdminAction } from '../utils/logger';

import type { AuthRequest } from '../middlewares/auth';
import type { Response } from 'express';

const router = Router();

router.use(adminLimiter);

const updateUserSchema = z
  .object({
    role: z.enum(['USER', 'ADMIN', 'TEACHER']).optional(),
    status: z.enum(['STUDENT', 'APPLICANT', 'GRADUATE', 'TEACHER']).optional(),
    currentGrade: z.number().min(1).max(11).optional(),
    desiredDirection: z
      .enum([
        'PHYSICS_MATH',
        'IT',
        'NATURAL_SCIENCE',
        'HUMANITIES',
        'SOCIO_ECONOMIC',
      ])
      .optional(),
  })
  .strict();

router.get('/users', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { search, role, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const searchStr = typeof search === 'string' ? search.slice(0, 100) : undefined;
    const where: Record<string, unknown> = {};

    if (searchStr) {
      where.OR = [
        { email: { contains: searchStr } },
        { name: { contains: searchStr } },
        { username: { contains: searchStr } },
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
          createdAt: true,
          _count: {
            select: {
              testAttempts: true,
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
    logger.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения пользователей' });
  }
});

router.get(
  '/users/:userId',
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params as { userId: string };

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
          createdAt: true,
          updatedAt: true,
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
      logger.error('Error fetching user:', error);
      res.status(500).json({ success: false, message: 'Ошибка получения пользователя' });
    }
  }
);

router.put(
  '/users/:userId',
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params as { userId: string };

      const validationResult = updateUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Некорректные данные',
          errors: validationResult.error.issues,
        });
      }

      const updateData = validationResult.data;

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
        },
      });

      const adminId = req.user?.id;
      if (adminId) logAdminAction(adminId, 'UPDATE_USER', userId, req, updateData);

      res.json({ success: true, data: user });
    } catch (error) {
      logger.error('Error updating user:', error);
      res.status(500).json({ success: false, message: 'Ошибка обновления пользователя' });
    }
  }
);

router.delete(
  '/users/:userId',
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params as { userId: string };
      const adminId = req.user?.id;
      if (!adminId) return res.status(401).json({ success: false, message: 'Не авторизован' });

      if (userId === adminId) {
        return res.status(400).json({ success: false, message: 'Нельзя удалить свой аккаунт' });
      }

      await prisma.user.delete({
        where: { id: userId },
      });

      logAdminAction(adminId, 'DELETE_USER', userId, req);

      res.json({ success: true, message: 'Пользователь удалён' });
    } catch (error) {
      logger.error('Error deleting user:', error);
      res.status(500).json({ success: false, message: 'Ошибка удаления пользователя' });
    }
  }
);

router.get('/stats', authenticateToken, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      usersToday,
      totalTests,
      testsToday,
      usersByRole,
      avgScoreResult,
      activeUsersWeek,
      testsBySubject,
      registrations,
      questionsBySubject,
      testsByExamType,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { gte: todayStart } },
      }),
      prisma.testAttempt.count(),
      prisma.testAttempt.count({
        where: { startedAt: { gte: todayStart } },
      }),
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      prisma.testAttempt.aggregate({
        _avg: { score: true },
        where: { score: { not: null } },
      }),
      prisma.testAttempt.findMany({
        where: { startedAt: { gte: weekAgo } },
        select: { userId: true },
        distinct: ['userId'],
      }),
      prisma.testAttempt.groupBy({
        by: ['testId'],
        _count: true,
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.question.groupBy({
        by: ['subject'],
        _count: true,
      }),
      prisma.test.groupBy({
        by: ['examType'],
        _count: true,
      }),
    ]);

    // Build testsBySubject by joining with test table
    const testIds = testsBySubject.map(t => t.testId);
    const tests = await prisma.test.findMany({
      where: { id: { in: testIds } },
      select: { id: true, subject: true },
    });
    const testSubjectMap: Record<string, string> = {};
    for (const t of tests) {
      testSubjectMap[t.id] = t.subject;
    }
    const attemptsBySubject: Record<string, number> = {};
    for (const entry of testsBySubject) {
      const subject = testSubjectMap[entry.testId];
      if (subject) {
        attemptsBySubject[subject] = (attemptsBySubject[subject] || 0) + entry._count;
      }
    }

    // Build registrations by day
    const registrationsByDay: Record<string, number> = {};
    for (const u of registrations) {
      const day = u.createdAt.toISOString().split('T')[0]!;
      registrationsByDay[day] = (registrationsByDay[day] ?? 0) + 1;
    }

    res.json({
      success: true,
      data: {
        totalUsers,
        usersToday,
        totalTests,
        testsToday,
        usersByRole: usersByRole.reduce(
          (acc, item) => {
            acc[item.role] = item._count;
            return acc;
          },
          {} as Record<string, number>
        ),
        avgScore: Math.round(avgScoreResult._avg.score ?? 0),
        activeUsersWeek: activeUsersWeek.length,
        testsBySubject: attemptsBySubject,
        registrationsByDay,
        questionsBySubject: questionsBySubject.reduce(
          (acc, item) => {
            acc[item.subject] = item._count;
            return acc;
          },
          {} as Record<string, number>
        ),
        testsByExamType: testsByExamType.reduce(
          (acc, item) => {
            acc[item.examType] = item._count;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
    });
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Ошибка получения статистики' });
  }
});

router.get(
  '/test-attempts',
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { subject, search, page = '1', limit = '20' } = req.query;
      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
      const skip = (pageNum - 1) * limitNum;

      const where: Record<string, unknown> = {};

      if (subject && typeof subject === 'string') {
        where.test = { subject };
      }

      if (search && typeof search === 'string') {
        where.user = {
          OR: [
            { name: { contains: search.slice(0, 100) } },
            { email: { contains: search.slice(0, 100) } },
          ],
        };
      }

      const [attempts, total] = await Promise.all([
        prisma.testAttempt.findMany({
          where,
          select: {
            id: true,
            score: true,
            startedAt: true,
            completedAt: true,
            user: {
              select: { id: true, name: true, email: true },
            },
            test: {
              select: { id: true, title: true, subject: true, examType: true },
            },
          },
          orderBy: { startedAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.testAttempt.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          attempts,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error) {
      logger.error('Error fetching test attempts:', error);
      res.status(500).json({ success: false, message: 'Ошибка получения попыток тестов' });
    }
  }
);

router.get(
  '/classrooms',
  authenticateToken,
  requireAdmin,
  async (_req: AuthRequest, res: Response) => {
    try {
      const classrooms = await prisma.classroom.findMany({
        include: {
          members: {
            select: { id: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Get teacher info
      const teacherIds = [...new Set(classrooms.map(c => c.teacherId))];
      const teachers = await prisma.user.findMany({
        where: { id: { in: teacherIds } },
        select: { id: true, name: true, email: true },
      });
      const teacherMap: Record<string, { name: string; email: string }> = {};
      for (const t of teachers) {
        teacherMap[t.id] = { name: t.name, email: t.email };
      }

      const data = classrooms.map(c => ({
        id: c.id,
        name: c.name,
        code: c.code,
        teacherId: c.teacherId,
        teacherName: teacherMap[c.teacherId]?.name ?? 'Неизвестный',
        teacherEmail: teacherMap[c.teacherId]?.email ?? '',
        membersCount: c.members.length,
        createdAt: c.createdAt,
      }));

      res.json({ success: true, data });
    } catch (error) {
      logger.error('Error fetching classrooms:', error);
      res.status(500).json({ success: false, message: 'Ошибка получения классов' });
    }
  }
);

router.delete(
  '/classrooms/:classroomId',
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { classroomId } = req.params as { classroomId: string };

      await prisma.classroom.delete({
        where: { id: classroomId },
      });

      const adminUserId = req.user?.id;
      if (adminUserId) logAdminAction(adminUserId, 'DELETE_CLASSROOM', classroomId, req);

      res.json({ success: true, message: 'Класс удалён' });
    } catch (error) {
      logger.error('Error deleting classroom:', error);
      res.status(500).json({ success: false, message: 'Ошибка удаления класса' });
    }
  }
);

router.get(
  '/system-info',
  authenticateToken,
  requireAdmin,
  async (_req: AuthRequest, res: Response) => {
    try {
      const [
        users,
        tests,
        questions,
        testAttempts,
        classrooms,
        achievements,
        notifications,
        duels,
        marathonRuns,
        srsCards,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.test.count(),
        prisma.question.count(),
        prisma.testAttempt.count(),
        prisma.classroom.count(),
        prisma.achievement.count(),
        prisma.notification.count(),
        prisma.duel.count(),
        prisma.marathonRun.count(),
        prisma.sRSCard.count(),
      ]);

      res.json({
        success: true,
        data: {
          users,
          tests,
          questions,
          testAttempts,
          classrooms,
          achievements,
          notifications,
          duels,
          marathonRuns,
          srsCards,
        },
      });
    } catch (error) {
      logger.error('Error fetching system info:', error);
      res.status(500).json({ success: false, message: 'Ошибка получения системной информации' });
    }
  }
);

router.get(
  '/cache/stats',
  authenticateToken,
  requireAdmin,
  async (_req: AuthRequest, res: Response) => {
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
      logger.error('Error fetching cache stats:', error);
      res.status(500).json({ success: false, message: 'Ошибка получения статистики кэша' });
    }
  }
);

router.delete(
  '/cache/:prefix',
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { prefix } = req.params as { prefix: string };
      const deleted = invalidateCache(prefix);

      const cacheAdminId = req.user?.id;
      if (cacheAdminId) logAdminAction(cacheAdminId, 'CLEAR_CACHE', undefined, req, { prefix, deleted });

      res.json({
        success: true,
        message: `Удалено ${deleted} записей кэша с префиксом "${prefix}"`,
      });
    } catch (error) {
      logger.error('Error clearing cache:', error);
      res.status(500).json({ success: false, message: 'Ошибка очистки кэша' });
    }
  }
);

router.delete(
  '/cache',
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      cacheService.clear();

      const clearAdminId = req.user?.id;
      if (clearAdminId) logAdminAction(clearAdminId, 'CLEAR_ALL_CACHE', undefined, req);

      res.json({
        success: true,
        message: 'Весь кэш очищен',
      });
    } catch (error) {
      logger.error('Error clearing all cache:', error);
      res.status(500).json({ success: false, message: 'Ошибка очистки кэша' });
    }
  }
);

export default router;

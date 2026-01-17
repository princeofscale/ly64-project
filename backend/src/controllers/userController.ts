import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import achievementService from '../services/achievementService';
import { AppError } from '../middlewares/errorHandler';

/**
 * User Controller
 * Контроллер для работы с профилем и статистикой пользователя
 */

/**
 * GET /api/users/profile
 * Получить профиль текущего пользователя
 */
export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new AppError('Не авторизован', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        status: true,
        currentGrade: true,
        desiredDirection: true,
        motivation: true,
        authProvider: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('Пользователь не найден', 404);
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/users/:username
 * Получить публичный профиль пользователя по username
 */
export async function getPublicProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        status: true,
        currentGrade: true,
        desiredDirection: true,
        authProvider: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('Пользователь не найден', 404);
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/users/profile
 * Обновить профиль пользователя
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    const { name, status, currentGrade, desiredDirection, motivation, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(status && { status }),
        ...(currentGrade && { currentGrade }),
        ...(desiredDirection && { desiredDirection }),
        ...(motivation !== undefined && { motivation }),
        ...(avatar !== undefined && { avatar }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        status: true,
        currentGrade: true,
        desiredDirection: true,
        motivation: true,
        authProvider: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/users/stats
 * Получить статистику пользователя
 */
export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;

    // Получаем все попытки прохождения тестов
    const testAttempts = await prisma.testAttempt.findMany({
      where: {
        userId,
        completedAt: { not: null },
      },
      include: {
        test: {
          select: {
            subject: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    // Подсчитываем общую статистику
    const totalTests = testAttempts.length;
    const averageScore =
      totalTests > 0
        ? testAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / totalTests
        : 0;
    const bestScore = totalTests > 0 ? Math.max(...testAttempts.map((a) => a.score || 0)) : 0;

    // Статистика по предметам
    const statsBySubject: Record<string, any> = {};
    testAttempts.forEach((attempt) => {
      const subject = attempt.test.subject;
      if (!statsBySubject[subject]) {
        statsBySubject[subject] = {
          subject,
          totalAttempts: 0,
          totalScore: 0,
          bestScore: 0,
          lastAttemptDate: null,
        };
      }

      statsBySubject[subject].totalAttempts++;
      statsBySubject[subject].totalScore += attempt.score || 0;
      statsBySubject[subject].bestScore = Math.max(
        statsBySubject[subject].bestScore,
        attempt.score || 0
      );
      if (
        !statsBySubject[subject].lastAttemptDate ||
        (attempt.completedAt &&
          attempt.completedAt > statsBySubject[subject].lastAttemptDate)
      ) {
        statsBySubject[subject].lastAttemptDate = attempt.completedAt;
      }
    });

    // Добавляем средний балл для каждого предмета
    Object.keys(statsBySubject).forEach((subject) => {
      statsBySubject[subject].averageScore =
        statsBySubject[subject].totalScore / statsBySubject[subject].totalAttempts;
    });

    // Последние попытки (для графика прогресса)
    const recentAttempts = testAttempts.slice(0, 10).map((attempt) => ({
      id: attempt.id,
      testId: attempt.testId,
      subject: attempt.test.subject,
      score: attempt.score,
      completedAt: attempt.completedAt,
    }));

    res.json({
      totalTests,
      averageScore: Math.round(averageScore * 10) / 10,
      bestScore,
      statsBySubject: Object.values(statsBySubject),
      recentAttempts,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/users/achievements
 * Получить достижения пользователя
 */
export async function getAchievements(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new AppError('Не авторизован', 401);
    }

    const achievements = await achievementService.getAllAchievementsWithProgress(userId);
    const stats = await achievementService.getUserAchievementStats(userId);

    res.json({
      achievements,
      stats,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/users/check-achievements
 * Проверить и разблокировать достижения пользователя
 */
export async function checkAchievements(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new AppError('Не авторизован', 401);
    }

    const newAchievements = await achievementService.checkAndUnlockAchievements(userId);

    res.json({
      message: 'Достижения проверены',
      newAchievements,
    });
  } catch (error) {
    next(error);
  }
}

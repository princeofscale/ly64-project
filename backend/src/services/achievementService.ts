import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import notificationService from './notificationService';
import { logger } from '../utils/logger';

import type { Prisma } from '@prisma/client';

type UserWithRelations = Prisma.UserGetPayload<{
  include: { progress: true; testAttempts: { include: { test: true } } };
}>;

export class AchievementService {
  async getAllAchievements() {
    return await prisma.achievement.findMany({
      orderBy: { points: 'asc' },
    });
  }

  async getUserAchievements(userId: string) {
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: 'desc' },
    });

    return userAchievements.map(ua => ({
      ...ua.achievement,
      unlockedAt: ua.unlockedAt,
    }));
  }

  async getAllAchievementsWithProgress(userId: string) {
    const allAchievements = await this.getAllAchievements();
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
    });

    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

    return allAchievements.map(achievement => {
      const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);

      return {
        ...achievement,
        isUnlocked: unlockedIds.has(achievement.id),
        unlockedAt: userAchievement?.unlockedAt,
      };
    });
  }

  async unlockAchievement(userId: string, achievementId: string) {
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement) {
      throw new AppError('Достижение не найдено', 404);
    }

    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId,
        },
      },
    });

    if (existing) {
      return { alreadyUnlocked: true, achievement };
    }

    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId,
      },
    });

    // Create persistent notification
    void notificationService.create(
      userId,
      'achievement',
      'Новое достижение!',
      `${achievement.icon} ${achievement.name}: ${achievement.description}`,
      { achievementId: achievement.id }
    );

    return { alreadyUnlocked: false, achievement };
  }

  async checkAndUnlockAchievements(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        progress: true,
        testAttempts: { include: { test: true } },
      },
    });

    if (!user) {
      throw new AppError('Пользователь не найден', 404);
    }

    const allAchievements = await this.getAllAchievements();
    const newlyUnlocked: Prisma.AchievementGetPayload<object>[] = [];

    for (const achievement of allAchievements) {
      const shouldUnlock = await this.checkAchievementCondition(achievement.condition, user);

      if (shouldUnlock) {
        const result = await this.unlockAchievement(userId, achievement.id);
        if (!result.alreadyUnlocked) {
          newlyUnlocked.push(achievement);
        }
      }
    }

    return newlyUnlocked;
  }

  private async checkAchievementCondition(condition: string, user: UserWithRelations): Promise<boolean> {
    switch (condition) {
      case 'register':
        return true;

      case 'complete_diagnostic': {
        const diagnosticResults = await prisma.diagnosticResult.findMany({
          where: { userId: user.id },
        });
        return diagnosticResults.length > 0;
      }

      case 'complete_first_test':
        return user.testAttempts.some(attempt => attempt.completedAt !== null);

      case 'complete_10_tests': {
        const completedTests = user.testAttempts.filter(
          attempt => attempt.completedAt !== null
        );
        return completedTests.length >= 10;
      }

      case 'score_90_percent':
        return user.testAttempts.some(
          attempt => attempt.score !== null && attempt.score >= 90
        );

      case 'perfect_score':
        return user.testAttempts.some(
          attempt => attempt.score !== null && attempt.score >= 100
        );

      case 'complete_5_math_tests': {
        const mathCompleted = user.testAttempts.filter(
          a => a.completedAt !== null && a.test.subject === 'MATHEMATICS'
        );
        return mathCompleted.length >= 5;
      }

      case 'complete_5_russian_tests': {
        const russianCompleted = user.testAttempts.filter(
          a => a.completedAt !== null && a.test.subject === 'RUSSIAN'
        );
        return russianCompleted.length >= 5;
      }

      case 'try_all_subjects': {
        const uniqueSubjects = new Set(
          user.testAttempts
            .filter(a => a.completedAt !== null)
            .map(a => a.test.subject)
        );
        return uniqueSubjects.size >= 3;
      }

      case 'seven_day_streak': {
        const streak7 = await prisma.userStreak.findUnique({
          where: { userId: user.id },
        });
        return (streak7?.longestStreak ?? 0) >= 7;
      }

      case 'thirty_day_streak': {
        const streak30 = await prisma.userStreak.findUnique({
          where: { userId: user.id },
        });
        return (streak30?.longestStreak ?? 0) >= 30;
      }

      case 'complete_test_under_10_min': {
        const TEN_MINUTES_MS = 10 * 60 * 1000;
        return user.testAttempts.some(a => {
          if (!a.completedAt) return false;
          const duration = a.completedAt.getTime() - a.startedAt.getTime();
          return duration > 0 && duration < TEN_MINUTES_MS;
        });
      }

      case 'complete_50_tests': {
        const completed50 = user.testAttempts.filter(
          a => a.completedAt !== null
        );
        return completed50.length >= 50;
      }

      default:
        logger.warn(`Unknown achievement condition: ${condition}`);
        return false;
    }
  }

  async getUserAchievementStats(userId: string) {
    const allAchievements = await this.getAllAchievements();
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });

    const totalPoints = userAchievements.reduce((sum, ua) => sum + ua.achievement.points, 0);

    const maxPoints = allAchievements.reduce((sum, achievement) => sum + achievement.points, 0);

    return {
      total: allAchievements.length,
      unlocked: userAchievements.length,
      totalPoints,
      maxPoints,
      percentage:
        allAchievements.length > 0
          ? Math.round((userAchievements.length / allAchievements.length) * 100)
          : 0,
    };
  }
}

export default new AchievementService();

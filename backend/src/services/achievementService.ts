import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

/**
 * Achievement Service
 * Сервис для управления достижениями пользователей
 */
export class AchievementService {
  /**
   * Получить все достижения
   */
  async getAllAchievements() {
    return await prisma.achievement.findMany({
      orderBy: { points: 'asc' },
    });
  }

  /**
   * Получить достижения пользователя
   * @param userId - ID пользователя
   */
  async getUserAchievements(userId: string) {
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: 'desc' },
    });

    return userAchievements.map((ua) => ({
      ...ua.achievement,
      unlockedAt: ua.unlockedAt,
    }));
  }

  /**
   * Получить все достижения с информацией о разблокировке для пользователя
   * @param userId - ID пользователя
   */
  async getAllAchievementsWithProgress(userId: string) {
    const allAchievements = await this.getAllAchievements();
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
    });

    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

    return allAchievements.map((achievement) => {
      const userAchievement = userAchievements.find(
        (ua) => ua.achievementId === achievement.id
      );

      return {
        ...achievement,
        isUnlocked: unlockedIds.has(achievement.id),
        unlockedAt: userAchievement?.unlockedAt,
      };
    });
  }

  /**
   * Разблокировать достижение для пользователя
   * @param userId - ID пользователя
   * @param achievementId - ID достижения
   */
  async unlockAchievement(userId: string, achievementId: string) {
    // Проверяем, существует ли достижение
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement) {
      throw new AppError('Достижение не найдено', 404);
    }

    // Проверяем, не разблокировано ли уже
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

    // Разблокируем достижение
    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId,
      },
    });

    return { alreadyUnlocked: false, achievement };
  }

  /**
   * Проверить и разблокировать достижения пользователя
   * Вызывается после определенных событий (регистрация, прохождение теста и т.д.)
   * @param userId - ID пользователя
   */
  async checkAndUnlockAchievements(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        progress: true,
        testAttempts: true,
      },
    });

    if (!user) {
      throw new AppError('Пользователь не найден', 404);
    }

    const allAchievements = await this.getAllAchievements();
    const newlyUnlocked: any[] = [];

    for (const achievement of allAchievements) {
      const shouldUnlock = await this.checkAchievementCondition(
        achievement.condition,
        user
      );

      if (shouldUnlock) {
        const result = await this.unlockAchievement(userId, achievement.id);
        if (!result.alreadyUnlocked) {
          newlyUnlocked.push(achievement);
        }
      }
    }

    return newlyUnlocked;
  }

  /**
   * Проверить условие достижения
   * @param condition - Условие достижения
   * @param user - Пользователь с его данными
   */
  private async checkAchievementCondition(condition: string, user: any): Promise<boolean> {
    switch (condition) {
      case 'register':
        // Достижение за регистрацию - всегда true
        return true;

      case 'complete_first_test':
        // Первый пройденный тест
        return user.testAttempts.some((attempt: any) => attempt.completedAt !== null);

      case 'complete_10_tests':
        // 10 пройденных тестов
        const completedTests = user.testAttempts.filter(
          (attempt: any) => attempt.completedAt !== null
        );
        return completedTests.length >= 10;

      case 'score_90_percent':
        // Хотя бы один тест с результатом 90%+
        return user.testAttempts.some(
          (attempt: any) => attempt.score !== null && attempt.score >= 90
        );

      case 'perfect_score':
        // Хотя бы один тест с результатом 100%
        return user.testAttempts.some(
          (attempt: any) => attempt.score !== null && attempt.score >= 100
        );

      default:
        console.warn(`Unknown achievement condition: ${condition}`);
        return false;
    }
  }

  /**
   * Получить общую статистику по достижениям пользователя
   * @param userId - ID пользователя
   */
  async getUserAchievementStats(userId: string) {
    const allAchievements = await this.getAllAchievements();
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });

    const totalPoints = userAchievements.reduce(
      (sum, ua) => sum + ua.achievement.points,
      0
    );

    const maxPoints = allAchievements.reduce(
      (sum, achievement) => sum + achievement.points,
      0
    );

    return {
      total: allAchievements.length,
      unlocked: userAchievements.length,
      totalPoints,
      maxPoints,
      percentage: allAchievements.length > 0
        ? Math.round((userAchievements.length / allAchievements.length) * 100)
        : 0,
    };
  }
}

export default new AchievementService();

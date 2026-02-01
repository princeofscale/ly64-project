import prisma from '../config/database';
import { logger } from '../utils/logger';
import { wsService } from './websocketService';

interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  totalActiveDays: number;
  isActiveToday: boolean;
}

interface DailyChallengeInfo {
  id: string;
  title: string;
  description: string;
  type: string;
  target: number;
  reward: number;
  subject: string | null;
  progress: number;
  completed: boolean;
}

interface ActivityResult {
  streakUpdated: boolean;
  newStreak: number;
  challengesUpdated: DailyChallengeInfo[];
  pointsEarned: number;
}

class StreakService {
  private static instance: StreakService;

  private constructor() {}

  public static getInstance(): StreakService {
    if (!StreakService.instance) {
      StreakService.instance = new StreakService();
    }
    return StreakService.instance;
  }

  async getStreak(userId: string): Promise<StreakInfo> {
    let streak = await prisma.userStreak.findUnique({
      where: { userId },
    });

    if (!streak) {
      streak = await prisma.userStreak.create({
        data: { userId },
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isActiveToday = streak.lastActivityDate
      ? new Date(streak.lastActivityDate).setHours(0, 0, 0, 0) === today.getTime()
      : false;

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActivityDate: streak.lastActivityDate,
      totalActiveDays: streak.totalActiveDays,
      isActiveToday,
    };
  }

  async updateStreak(userId: string): Promise<{ updated: boolean; newStreak: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = await prisma.userStreak.findUnique({
      where: { userId },
    });

    if (!streak) {
      streak = await prisma.userStreak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: today,
          totalActiveDays: 1,
        },
      });
      return { updated: true, newStreak: 1 };
    }

    const lastActivity = streak.lastActivityDate
      ? new Date(streak.lastActivityDate)
      : null;

    if (lastActivity) {
      lastActivity.setHours(0, 0, 0, 0);
    }

    if (lastActivity && lastActivity.getTime() === today.getTime()) {
      return { updated: false, newStreak: streak.currentStreak };
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak: number;
    if (lastActivity && lastActivity.getTime() === yesterday.getTime()) {
      newStreak = streak.currentStreak + 1;
    } else {
      newStreak = 1;
    }

    const longestStreak = Math.max(streak.longestStreak, newStreak);

    await prisma.userStreak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak,
        lastActivityDate: today,
        totalActiveDays: streak.totalActiveDays + 1,
      },
    });

    logger.info('[Streak] Updated', { userId, newStreak, longestStreak });

    return { updated: true, newStreak };
  }

  async getDailyChallenges(userId: string): Promise<DailyChallengeInfo[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let challenges = await prisma.dailyChallenge.findMany({
      where: {
        date: today,
      },
    });

    if (challenges.length === 0) {
      challenges = await this.generateDailyChallenges(today);
    }

    const completions = await prisma.dailyChallengeCompletion.findMany({
      where: {
        userId,
        challengeId: { in: challenges.map(c => c.id) },
      },
    });

    const completionMap = new Map(completions.map(c => [c.challengeId, c]));

    return challenges.map(challenge => {
      const completion = completionMap.get(challenge.id);
      return {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        type: challenge.type,
        target: challenge.target,
        reward: challenge.reward,
        subject: challenge.subject,
        progress: completion?.progress || 0,
        completed: completion?.completed || false,
      };
    });
  }

  private async generateDailyChallenges(date: Date): Promise<any[]> {
    const challengeTemplates = [
      {
        title: 'Решите 3 теста',
        description: 'Завершите любые 3 теста сегодня',
        type: 'complete_tests',
        target: 3,
        reward: 50,
      },
      {
        title: 'Набери 80% на тесте',
        description: 'Получите результат 80% или выше на любом тесте',
        type: 'score_percentage',
        target: 80,
        reward: 30,
      },
      {
        title: '10 правильных ответов подряд',
        description: 'Ответьте правильно на 10 вопросов подряд',
        type: 'correct_streak',
        target: 10,
        reward: 40,
      },
      {
        title: 'Занимайтесь 30 минут',
        description: 'Проведите 30 минут за решением задач',
        type: 'time_spent',
        target: 30,
        reward: 25,
      },
      {
        title: 'Изучите новую тему',
        description: 'Прочитайте теорию по любой теме',
        type: 'theory_viewed',
        target: 1,
        reward: 20,
      },
    ];

    const shuffled = challengeTemplates.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    const challenges = await Promise.all(
      selected.map(template =>
        prisma.dailyChallenge.create({
          data: {
            date,
            ...template,
          },
        })
      )
    );

    logger.info('[DailyChallenge] Generated challenges for', { date });
    return challenges;
  }

  async updateChallengeProgress(
    userId: string,
    type: string,
    value: number
  ): Promise<DailyChallengeInfo[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const challenges = await prisma.dailyChallenge.findMany({
      where: {
        date: today,
        type,
      },
    });

    const updated: DailyChallengeInfo[] = [];

    for (const challenge of challenges) {
      let completion = await prisma.dailyChallengeCompletion.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId: challenge.id,
          },
        },
      });

      if (!completion) {
        completion = await prisma.dailyChallengeCompletion.create({
          data: {
            userId,
            challengeId: challenge.id,
            progress: 0,
          },
        });
      }

      if (completion.completed) continue;

      let newProgress: number;
      if (type === 'score_percentage' || type === 'correct_streak') {
        newProgress = Math.max(completion.progress, value);
      } else {
        newProgress = completion.progress + value;
      }

      const completed = newProgress >= challenge.target;

      await prisma.dailyChallengeCompletion.update({
        where: { id: completion.id },
        data: {
          progress: newProgress,
          completed,
          completedAt: completed ? new Date() : null,
        },
      });

      if (completed) {
        await this.recordActivity(userId, 'challenge_completed', challenge.reward, {
          challengeId: challenge.id,
          title: challenge.title,
        });

        wsService.sendToUser(userId, 'challenge_completed', {
          challengeId: challenge.id,
          title: challenge.title,
          reward: challenge.reward,
        });

        logger.info('[DailyChallenge] Completed', { userId, challengeId: challenge.id });
      }

      updated.push({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        type: challenge.type,
        target: challenge.target,
        reward: challenge.reward,
        subject: challenge.subject,
        progress: newProgress,
        completed,
      });
    }

    return updated;
  }

  async recordActivity(
    userId: string,
    type: string,
    points: number = 0,
    metadata?: Record<string, unknown>
  ): Promise<ActivityResult> {
    await prisma.userActivity.create({
      data: {
        userId,
        type,
        points,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    const streakResult = await this.updateStreak(userId);

    let challengesUpdated: DailyChallengeInfo[] = [];

    switch (type) {
      case 'test_completed':
        challengesUpdated = await this.updateChallengeProgress(userId, 'complete_tests', 1);
        break;
      case 'high_score':
        const score = (metadata as any)?.score || 0;
        challengesUpdated = await this.updateChallengeProgress(userId, 'score_percentage', score);
        break;
      case 'correct_streak':
        const streak = (metadata as any)?.streak || 0;
        challengesUpdated = await this.updateChallengeProgress(userId, 'correct_streak', streak);
        break;
      case 'time_spent':
        const minutes = (metadata as any)?.minutes || 0;
        challengesUpdated = await this.updateChallengeProgress(userId, 'time_spent', minutes);
        break;
      case 'theory_viewed':
        challengesUpdated = await this.updateChallengeProgress(userId, 'theory_viewed', 1);
        break;
    }

    return {
      streakUpdated: streakResult.updated,
      newStreak: streakResult.newStreak,
      challengesUpdated,
      pointsEarned: points,
    };
  }

  async getActivityStats(userId: string, days: number = 30): Promise<{
    totalPoints: number;
    activitiesByType: Record<string, number>;
    dailyActivity: { date: string; points: number }[];
  }> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const activities = await prisma.userActivity.findMany({
      where: {
        userId,
        createdAt: { gte: since },
      },
    });

    const totalPoints = activities.reduce((sum, a) => sum + a.points, 0);

    const activitiesByType: Record<string, number> = {};
    activities.forEach(a => {
      activitiesByType[a.type] = (activitiesByType[a.type] || 0) + 1;
    });

    const dailyMap = new Map<string, number>();
    activities.forEach(a => {
      const date = a.createdAt.toISOString().split('T')[0];
      dailyMap.set(date, (dailyMap.get(date) || 0) + a.points);
    });

    const dailyActivity = Array.from(dailyMap.entries())
      .map(([date, points]) => ({ date, points }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalPoints,
      activitiesByType,
      dailyActivity,
    };
  }
}

export const streakService = StreakService.getInstance();
export default streakService;

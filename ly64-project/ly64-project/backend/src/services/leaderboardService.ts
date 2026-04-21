import {
  STATS_CONSTANTS,
  TIME_CONSTANTS,
  DEFAULT_VALUES,
  ERROR_MESSAGES,
} from '../constants/statsConstants';
import { StatisticsCalculator } from '../utils/statisticsUtils';

import type { LeaderboardResponse, LeaderboardEntry, UserRankResponse } from '../types/userTypes';
import type { PrismaClient } from '@prisma/client';

type LeaderboardPeriod = 'all' | 'week' | 'month';

export class LeaderboardService {
  constructor(private readonly prisma: PrismaClient) {}

  public async getLeaderboard(
    period: string = DEFAULT_VALUES.LEADERBOARD_PERIOD,
    subject?: string,
    limit: string = String(STATS_CONSTANTS.LEADERBOARD_DEFAULT_LIMIT)
  ): Promise<LeaderboardResponse> {
    const dateFilter = this.buildDateFilter(period as LeaderboardPeriod);
    const subjectFilter = this.buildSubjectFilter(subject);

    const usersWithStats = await this.prisma.user.findMany({
      where: {
        isPublic: true,
        testAttempts: {
          some: {
            completedAt: { not: null },
            ...dateFilter,
            ...subjectFilter,
          },
        },
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        currentGrade: true,
        testAttempts: {
          where: {
            completedAt: { not: null },
            ...dateFilter,
            ...subjectFilter,
          },
          select: {
            score: true,
            completedAt: true,
          },
        },
        userAchievements: {
          select: {
            id: true,
          },
        },
      },
    });

    const leaderboard = this.calculateLeaderboard(usersWithStats);
    const rankedLeaderboard = this.applyRanking(leaderboard, parseInt(limit, 10));

    return {
      period,
      subject: subject ?? DEFAULT_VALUES.LEADERBOARD_SUBJECT,
      total: rankedLeaderboard.length,
      leaderboard: rankedLeaderboard,
    };
  }

  public async getUserRank(userId: string): Promise<UserRankResponse> {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        isPublic: true,
        testAttempts: {
          where: { completedAt: { not: null } },
          select: { score: true },
        },
        userAchievements: {
          select: { id: true },
        },
      },
    });

    if (!currentUser) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const userTests = currentUser.testAttempts.length;
    const scores = currentUser.testAttempts.map(a => a.score);
    const userAvgScore = StatisticsCalculator.calculateAverageScore(scores);
    const userBestScore = StatisticsCalculator.calculateBestScore(scores);
    const userAchievements = currentUser.userAchievements.length;

    const userPoints = StatisticsCalculator.calculateUserPoints(
      userTests,
      userAvgScore,
      userBestScore,
      userAchievements
    );

    const higherRankedCount = await this.countHigherRankedUsers(userPoints);
    const rank = Number(higherRankedCount[0]?.count ?? 0) + 1;

    return {
      rank,
      points: userPoints,
      stats: {
        totalTests: userTests,
        averageScore: StatisticsCalculator.roundToDecimal(userAvgScore),
        bestScore: userBestScore,
        achievementsCount: userAchievements,
      },
    };
  }

  private buildDateFilter(period: LeaderboardPeriod): Record<string, unknown> {
    const now = new Date();

    if (period === 'week') {
      const weekAgo = new Date(
        now.getTime() -
          TIME_CONSTANTS.DAYS_IN_WEEK *
            TIME_CONSTANTS.HOURS_IN_DAY *
            TIME_CONSTANTS.MINUTES_IN_HOUR *
            TIME_CONSTANTS.SECONDS_IN_MINUTE *
            TIME_CONSTANTS.MILLISECONDS_IN_SECOND
      );
      return { completedAt: { gte: weekAgo } };
    }

    if (period === 'month') {
      const monthAgo = new Date(
        now.getTime() -
          TIME_CONSTANTS.DAYS_IN_MONTH *
            TIME_CONSTANTS.HOURS_IN_DAY *
            TIME_CONSTANTS.MINUTES_IN_HOUR *
            TIME_CONSTANTS.SECONDS_IN_MINUTE *
            TIME_CONSTANTS.MILLISECONDS_IN_SECOND
      );
      return { completedAt: { gte: monthAgo } };
    }

    return {};
  }

  private buildSubjectFilter(subject?: string): Record<string, unknown> {
    if (!subject || typeof subject !== 'string') {
      return {};
    }
    return { test: { subject } };
  }

  private calculateLeaderboard(
    users: ReadonlyArray<{
      id: string;
      username: string;
      name: string;
      avatar: string | null;
      currentGrade: number;
      testAttempts: ReadonlyArray<{ score: number | null }>;
      userAchievements: ReadonlyArray<{ id: string }>;
    }>
  ): LeaderboardEntry[] {
    return users.map(user => {
      const totalTests = user.testAttempts.length;
      const scores = user.testAttempts.map(a => a.score);
      const averageScore = StatisticsCalculator.calculateAverageScore(scores);
      const bestScore = StatisticsCalculator.calculateBestScore(scores);
      const achievementsCount = user.userAchievements.length;

      const points = StatisticsCalculator.calculateUserPoints(
        totalTests,
        averageScore,
        bestScore,
        achievementsCount
      );

      return {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        currentGrade: user.currentGrade,
        stats: {
          totalTests,
          averageScore: StatisticsCalculator.roundToDecimal(averageScore),
          bestScore,
          achievementsCount,
          points,
        },
        rank: 0,
      };
    });
  }

  private applyRanking(leaderboard: LeaderboardEntry[], limit: number): LeaderboardEntry[] {
    const sorted = leaderboard.sort((a, b) => b.stats.points - a.stats.points);

    return sorted.slice(0, limit).map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  }

  private async countHigherRankedUsers(
    userPoints: number
  ): Promise<ReadonlyArray<{ count: bigint }>> {
    return this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(DISTINCT u.id) as count
      FROM "User" u
      LEFT JOIN "TestAttempt" ta ON ta."userId" = u.id AND ta."completedAt" IS NOT NULL
      LEFT JOIN "UserAchievement" ua ON ua."userId" = u.id
      WHERE u."isPublic" = true
      GROUP BY u.id
      HAVING (
        COUNT(ta.id) * 10 +
        COALESCE(AVG(ta.score), 0) * 5 +
        COALESCE(MAX(ta.score), 0) * 2 +
        COUNT(ua.id) * 50
      ) > ${userPoints}
    `;
  }
}

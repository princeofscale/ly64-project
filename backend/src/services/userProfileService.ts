import { STATS_CONSTANTS, ERROR_MESSAGES } from '../constants/statsConstants';
import { StatisticsCalculator } from '../utils/statisticsUtils';

import type {
  PublicProfileResponse,
  PrivateProfileResponse,
  ProfileStats,
  AchievementData,
  RecentTestData,
  SearchUserResult,
} from '../types/userTypes';
import type { PrismaClient } from '@prisma/client';

export class UserProfileService {
  constructor(private readonly prisma: PrismaClient) {}

  public async getPublicProfile(
    username: string
  ): Promise<PublicProfileResponse | PrivateProfileResponse> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        status: true,
        currentGrade: true,
        desiredDirection: true,
        avatar: true,
        bio: true,
        isPublic: true,
        createdAt: true,
        userAchievements: {
          include: {
            achievement: true,
          },
          orderBy: {
            unlockedAt: 'desc',
          },
        },
        testAttempts: {
          where: {
            completedAt: { not: null },
          },
          select: {
            score: true,
            completedAt: true,
            test: {
              select: {
                subject: true,
              },
            },
          },
          orderBy: {
            completedAt: 'desc',
          },
          take: STATS_CONSTANTS.RECENT_ATTEMPTS_LIMIT,
        },
      },
    });

    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (!user.isPublic) {
      return this.createPrivateProfileResponse(user);
    }

    return this.createPublicProfileResponse(user);
  }

  private createPrivateProfileResponse(user: {
    username: string;
    name: string;
    avatar: string | null;
  }): PrivateProfileResponse {
    return {
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      isPublic: false,
      message: ERROR_MESSAGES.PROFILE_PRIVATE,
    };
  }

  private async createPublicProfileResponse(user: {
    id: string;
    username: string;
    name: string;
    status: string;
    currentGrade: number;
    desiredDirection: string | null;
    avatar: string | null;
    bio: string | null;
    isPublic: boolean;
    createdAt: Date;
    userAchievements: ReadonlyArray<{
      unlockedAt: Date;
      achievement: {
        id: string;
        name: string;
        description: string;
        icon: string;
        points: number;
      };
    }>;
    testAttempts: ReadonlyArray<{
      score: number | null;
      completedAt: Date | null;
      test: {
        subject: string;
      };
    }>;
  }): Promise<PublicProfileResponse> {
    const stats = await this.calculateProfileStats(user.id);
    const achievements = this.mapAchievements(user.userAchievements);
    const recentTests = this.mapRecentTests(user.testAttempts);

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      status: user.status,
      currentGrade: user.currentGrade,
      desiredDirection: user.desiredDirection,
      avatar: user.avatar,
      bio: user.bio,
      isPublic: user.isPublic,
      createdAt: user.createdAt,
      stats,
      achievements,
      recentTests,
    };
  }

  private async calculateProfileStats(userId: string): Promise<ProfileStats> {
    const testAttempts = await this.prisma.testAttempt.findMany({
      where: {
        userId,
        completedAt: { not: null },
      },
      select: {
        score: true,
      },
    });

    const userAchievementsCount = await this.prisma.userAchievement.count({
      where: { userId },
    });

    const scores = testAttempts.map(attempt => attempt.score);
    const totalTests = testAttempts.length;
    const averageScore = StatisticsCalculator.roundToDecimal(
      StatisticsCalculator.calculateAverageScore(scores)
    );
    const bestScore = StatisticsCalculator.calculateBestScore(scores);

    return {
      totalTests,
      averageScore,
      bestScore,
      achievementsCount: userAchievementsCount,
    };
  }

  private mapAchievements(
    userAchievements: ReadonlyArray<{
      unlockedAt: Date;
      achievement: {
        id: string;
        name: string;
        description: string;
        icon: string;
        points: number;
      };
    }>
  ): ReadonlyArray<AchievementData> {
    return userAchievements.map(ua => ({
      id: ua.achievement.id,
      name: ua.achievement.name,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      points: ua.achievement.points,
      unlockedAt: ua.unlockedAt,
    }));
  }

  private mapRecentTests(
    testAttempts: ReadonlyArray<{
      score: number | null;
      completedAt: Date | null;
      test: {
        subject: string;
      };
    }>
  ): ReadonlyArray<RecentTestData> {
    return testAttempts.map(ta => ({
      score: ta.score,
      subject: ta.test.subject,
      completedAt: ta.completedAt,
    }));
  }

  public async searchUsers(query: string): Promise<ReadonlyArray<SearchUserResult>> {
    if (!query || query.length < STATS_CONSTANTS.MIN_SEARCH_QUERY_LENGTH) {
      return [];
    }

    return this.prisma.user.findMany({
      where: {
        isPublic: true,
        OR: [
          { username: { contains: query.toLowerCase() } },
          { name: { contains: query.toLowerCase() } },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        currentGrade: true,
      },
      take: STATS_CONSTANTS.SEARCH_RESULTS_LIMIT,
    });
  }
}

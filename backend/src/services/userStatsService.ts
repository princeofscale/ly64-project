import { STATS_CONSTANTS, TIME_CONSTANTS, DEFAULT_VALUES } from '../constants/statsConstants';
import { StatisticsCalculator, DateCalculator } from '../utils/statisticsUtils';

import predictionService from './predictionService';

import type {
  UserStatsResponse,
  DailyActivity,
  TimeHeatmapEntry,
  SubjectStats,
  WeakTopic,
  RecentAttemptData,
} from '../types/userTypes';
import type { PrismaClient } from '@prisma/client';

interface TestAttemptWithDetails {
  readonly id: string;
  readonly testId: string;
  readonly score: number | null;
  readonly completedAt: Date | null;
  readonly answers: string | null;
  readonly questionsOrder: string | null;
  readonly test: {
    readonly subject: string;
    readonly questions: ReadonlyArray<{
      readonly question: {
        readonly id: string;
        readonly subject: string;
        readonly topic: string | null;
        readonly correctAnswer: string;
      };
    }>;
  };
}

interface SubjectStatsAccumulator {
  subject: string;
  totalAttempts: number;
  totalScore: number;
  bestScore: number;
  lastAttemptDate: Date | null;
}

interface DailyActivityAccumulator {
  count: number;
  totalScore: number;
}

interface TopicStatsAccumulator {
  correct: number;
  total: number;
  subject: string;
}

export class UserStatsService {
  constructor(private readonly prisma: PrismaClient) {}

  public async getUserStats(userId: string): Promise<UserStatsResponse> {
    const testAttempts = await this.fetchTestAttempts(userId);
    const detailedAttempts = await this.fetchDetailedAttempts(userId);

    const totalTests = testAttempts.length;
    const scores = testAttempts.map(attempt => attempt.score);
    const averageScore = StatisticsCalculator.calculateAverageScore(scores);
    const bestScore = StatisticsCalculator.calculateBestScore(scores);

    const statsBySubject = this.calculateStatsBySubject(testAttempts);
    const recentAttempts = this.getRecentAttempts(testAttempts);
    const dailyActivity = this.calculateDailyActivity(testAttempts);
    const timeHeatmap = this.calculateTimeHeatmap(testAttempts);
    const platformAverage = await this.calculatePlatformAverage();

    const { currentStreak, longestStreak } = this.calculateStreaks(dailyActivity);
    const totalTimeSpent = this.calculateTotalTimeSpent(testAttempts);
    const weeklyProgress = this.calculateWeeklyProgress(testAttempts);
    const favoriteSubject = this.findFavoriteSubject(statsBySubject);

    const prediction = predictionService.calculatePrediction(
      testAttempts,
      totalTests,
      averageScore,
      dailyActivity,
      currentStreak
    );

    const weakTopics = await this.analyzeWeakTopics(detailedAttempts);
    const comparison = await this.compareWithOthers(userId, averageScore);

    return {
      totalTests,
      averageScore,
      bestScore,
      statsBySubject,
      recentAttempts,
      dailyActivity,
      timeHeatmap,
      platformAverage,
      currentStreak,
      longestStreak,
      totalTimeSpent,
      weeklyProgress,
      favoriteSubject,
      predictedScore: prediction.predictedScore,
      predictionConfidence: prediction.confidence,
      predictionFactors: prediction.factors,
      weakTopics,
      percentile: comparison.percentile,
      usersBeaten: comparison.usersBeaten,
      totalUsers: comparison.totalUsers,
      userRank: comparison.userRank,
    };
  }

  private async fetchTestAttempts(userId: string) {
    return this.prisma.testAttempt.findMany({
      where: {
        userId,
        completedAt: { not: null },
      },
      include: {
        test: {
          select: {
            subject: true,
            questions: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });
  }

  private async fetchDetailedAttempts(
    userId: string
  ): Promise<ReadonlyArray<TestAttemptWithDetails>> {
    return this.prisma.testAttempt.findMany({
      where: {
        userId,
        completedAt: { not: null },
      },
      include: {
        test: {
          include: {
            questions: {
              include: {
                question: true,
              },
            },
          },
        },
      },
    });
  }

  private calculateStatsBySubject(
    attempts: ReadonlyArray<{
      score: number | null;
      completedAt: Date | null;
      test: { subject: string };
    }>
  ): ReadonlyArray<SubjectStats> {
    const statsMap = new Map<string, SubjectStatsAccumulator>();

    attempts.forEach(attempt => {
      const subject = attempt.test.subject;
      const stats = statsMap.get(subject) ?? {
        subject,
        totalAttempts: 0,
        totalScore: 0,
        bestScore: 0,
        lastAttemptDate: null,
      };

      stats.totalAttempts++;
      stats.totalScore += attempt.score ?? 0;
      stats.bestScore = Math.max(stats.bestScore, attempt.score ?? 0);

      if (
        attempt.completedAt &&
        (!stats.lastAttemptDate || attempt.completedAt > stats.lastAttemptDate)
      ) {
        stats.lastAttemptDate = attempt.completedAt;
      }

      statsMap.set(subject, stats);
    });

    return Array.from(statsMap.values()).map(stats => ({
      subject: stats.subject,
      totalAttempts: stats.totalAttempts,
      averageScore: stats.totalScore / stats.totalAttempts,
      bestScore: stats.bestScore,
      lastAttemptDate: stats.lastAttemptDate,
    }));
  }

  private getRecentAttempts(
    attempts: ReadonlyArray<{
      id: string;
      testId: string;
      score: number | null;
      completedAt: Date | null;
      test: { subject: string };
    }>
  ): ReadonlyArray<RecentAttemptData> {
    return attempts.slice(0, STATS_CONSTANTS.RECENT_ATTEMPTS_LIMIT).map(attempt => ({
      id: attempt.id,
      testId: attempt.testId,
      subject: attempt.test.subject,
      score: attempt.score,
      completedAt: attempt.completedAt,
    }));
  }

  private calculateDailyActivity(
    attempts: ReadonlyArray<{ score: number | null; completedAt: Date | null }>
  ): ReadonlyArray<DailyActivity> {
    const activityMap = new Map<string, DailyActivityAccumulator>();

    for (let i = 0; i < STATS_CONSTANTS.ACTIVITY_DAYS; i++) {
      const date = DateCalculator.getDateDaysAgo(i);
      const dateKey = DateCalculator.getDateKey(date);
      activityMap.set(dateKey, { count: 0, totalScore: 0 });
    }

    attempts.forEach(attempt => {
      if (attempt.completedAt) {
        const dateKey = DateCalculator.getDateKey(attempt.completedAt);
        const activity = activityMap.get(dateKey);
        if (activity) {
          activity.count++;
          activity.totalScore += attempt.score ?? 0;
        }
      }
    });

    return Array.from(activityMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, activity]) => ({
        date,
        count: activity.count,
        avgScore:
          activity.count > 0
            ? StatisticsCalculator.roundToDecimal(activity.totalScore / activity.count)
            : 0,
      }));
  }

  private calculateTimeHeatmap(
    attempts: ReadonlyArray<{ score: number | null; completedAt: Date | null }>
  ): ReadonlyArray<TimeHeatmapEntry> {
    const heatmap = new Map<number, DailyActivityAccumulator>();

    for (let i = 0; i < STATS_CONSTANTS.HOURS_IN_DAY; i++) {
      heatmap.set(i, { count: 0, totalScore: 0 });
    }

    attempts.forEach(attempt => {
      if (attempt.completedAt) {
        const hour = attempt.completedAt.getHours();
        const stats = heatmap.get(hour)!;
        stats.count++;
        stats.totalScore += attempt.score ?? 0;
      }
    });

    return Array.from(heatmap.entries()).map(([hour, stats]) => ({
      hour,
      testCount: stats.count,
      avgScore:
        stats.count > 0 ? StatisticsCalculator.roundToDecimal(stats.totalScore / stats.count) : 0,
    }));
  }

  private async calculatePlatformAverage(): Promise<number> {
    const allAttempts = await this.prisma.testAttempt.findMany({
      where: { completedAt: { not: null } },
      select: { score: true },
    });

    const scores = allAttempts.map(attempt => attempt.score);
    return StatisticsCalculator.roundToDecimal(StatisticsCalculator.calculateAverageScore(scores));
  }

  private calculateStreaks(dailyActivity: ReadonlyArray<DailyActivity>): {
    currentStreak: number;
    longestStreak: number;
  } {
    const sortedDates = dailyActivity
      .filter(day => day.count > 0)
      .map(day => day.date)
      .sort()
      .reverse();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = DateCalculator.getTodayMidnight();

    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);

      if (i === 0) {
        const diff = DateCalculator.getDaysDifference(today, currentDate);
        if (diff <= 1) {
          currentStreak = 1;
          tempStreak = 1;
        } else {
          break;
        }
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const diff = DateCalculator.getDaysDifference(prevDate, currentDate);

        if (diff === 1) {
          currentStreak++;
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          if (i < sortedDates.length - 1) {
            tempStreak = 1;
          } else {
            break;
          }
        }
      }
    }

    longestStreak = Math.max(longestStreak, currentStreak);

    return { currentStreak, longestStreak };
  }

  private calculateTotalTimeSpent(
    attempts: ReadonlyArray<{ test: { questions?: ReadonlyArray<unknown> | null } }>
  ): number {
    return attempts.reduce((sum, attempt) => {
      const questionCount =
        attempt.test.questions?.length ?? STATS_CONSTANTS.DEFAULT_QUESTION_COUNT;
      return sum + questionCount * STATS_CONSTANTS.MINUTES_PER_QUESTION;
    }, 0);
  }

  private calculateWeeklyProgress(
    attempts: ReadonlyArray<{ score: number | null; completedAt: Date | null }>
  ): number {
    const weekAgo = DateCalculator.getDateDaysAgo(TIME_CONSTANTS.DAYS_IN_WEEK);
    const twoWeeksAgo = DateCalculator.getDateDaysAgo(TIME_CONSTANTS.DAYS_IN_TWO_WEEKS);

    const thisWeekAttempts = attempts.filter(a => a.completedAt && a.completedAt >= weekAgo);
    const lastWeekAttempts = attempts.filter(
      a => a.completedAt && a.completedAt >= twoWeeksAgo && a.completedAt < weekAgo
    );

    const thisWeekAvg = StatisticsCalculator.calculateAverageScore(
      thisWeekAttempts.map(a => a.score)
    );
    const lastWeekAvg = StatisticsCalculator.calculateAverageScore(
      lastWeekAttempts.map(a => a.score)
    );

    return lastWeekAvg > 0 ? StatisticsCalculator.roundToDecimal(thisWeekAvg - lastWeekAvg) : 0;
  }

  private findFavoriteSubject(statsBySubject: ReadonlyArray<SubjectStats>): string {
    if (statsBySubject.length === 0) {
      return DEFAULT_VALUES.FAVORITE_SUBJECT;
    }

    return statsBySubject.reduce((favorite, stats) =>
      stats.totalAttempts > favorite.totalAttempts ? stats : favorite
    ).subject;
  }

  private async analyzeWeakTopics(
    attempts: ReadonlyArray<TestAttemptWithDetails>
  ): Promise<ReadonlyArray<WeakTopic>> {
    const topicStats = new Map<string, TopicStatsAccumulator>();

    attempts.forEach(attempt => {
      try {
        const answers = JSON.parse(attempt.answers ?? '[]');
        const questionsOrder = attempt.questionsOrder ? JSON.parse(attempt.questionsOrder) : null;

        attempt.test.questions.forEach((tq, index) => {
          const question = tq.question;
          const topic = question.topic ?? 'Общие вопросы';
          const subject = question.subject;
          const topicKey = `${subject}:${topic}`;

          const stats = topicStats.get(topicKey) ?? {
            correct: 0,
            total: 0,
            subject,
          };

          stats.total++;

          const questionIndex = questionsOrder ? questionsOrder.indexOf(question.id) : index;

          if (questionIndex >= 0 && answers[questionIndex] !== undefined) {
            const userAnswer = answers[questionIndex];
            const isCorrect = this.checkAnswer(userAnswer, question.correctAnswer);

            if (isCorrect) {
              stats.correct++;
            }
          }

          topicStats.set(topicKey, stats);
        });
      } catch {
        // Skip invalid data
      }
    });

    const weakTopics: WeakTopic[] = [];

    topicStats.forEach((stats, key) => {
      if (stats.total >= STATS_CONSTANTS.MIN_TOPIC_ATTEMPTS) {
        const avgScore = Math.round(
          (stats.correct / stats.total) * StatisticsCalculator.roundToDecimal(100)
        );
        const [subject, topic] = key.split(':');

        if (avgScore < STATS_CONSTANTS.WEAK_TOPIC_THRESHOLD) {
          weakTopics.push({
            topic,
            subject,
            avgScore,
            totalAttempts: stats.total,
            wrongAnswers: stats.total - stats.correct,
          });
        }
      }
    });

    return weakTopics
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, STATS_CONSTANTS.TOP_WEAK_TOPICS_LIMIT);
  }

  private checkAnswer(userAnswer: unknown, correctAnswerStr: string): boolean {
    let correctAnswer: unknown = correctAnswerStr;

    try {
      correctAnswer = JSON.parse(correctAnswerStr);
    } catch {
      // Use as string
    }

    if (Array.isArray(correctAnswer)) {
      return (
        correctAnswer.includes(userAnswer) ||
        JSON.stringify(correctAnswer) === JSON.stringify(userAnswer)
      );
    }

    return String(correctAnswer).toLowerCase().trim() === String(userAnswer).toLowerCase().trim();
  }

  private async compareWithOthers(userId: string, userAverageScore: number) {
    const allUsersStats = await this.prisma.user.findMany({
      where: {
        isPublic: true,
        testAttempts: {
          some: {
            completedAt: { not: null },
          },
        },
      },
      select: {
        id: true,
        testAttempts: {
          where: { completedAt: { not: null } },
          select: { score: true },
        },
      },
    });

    const userAverages = allUsersStats.map(u => {
      const scores = u.testAttempts.map(t => t.score);
      return {
        id: u.id,
        avg: StatisticsCalculator.calculateAverageScore(scores),
        tests: scores.length,
      };
    });

    const usersBelow = userAverages.filter(u => u.avg < userAverageScore).length;
    const percentile = StatisticsCalculator.calculatePercentile(
      userAverageScore,
      userAverages.map(u => u.avg)
    );

    const sortedByAvg = [...userAverages].sort((a, b) => b.avg - a.avg);
    const userRank = sortedByAvg.findIndex(u => u.id === userId) + 1;

    return {
      percentile,
      usersBeaten: usersBelow,
      totalUsers: userAverages.length,
      userRank,
    };
  }
}

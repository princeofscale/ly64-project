import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import achievementService from '../services/achievementService';
import errorAnalysisService from '../services/errorAnalysisService';
import { AppError } from '../middlewares/errorHandler';

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
        bio: true,
        isPublic: true,
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
          take: 10,
        },
      },
    });

    if (!user) {
      throw new AppError('Пользователь не найден', 404);
    }

    if (!user.isPublic) {
      res.json({
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        isPublic: false,
        message: 'Этот профиль приватный',
      });
      return;
    }

    const totalTests = await prisma.testAttempt.count({
      where: {
        userId: user.id,
        completedAt: { not: null },
      },
    });

    const testAttempts = await prisma.testAttempt.findMany({
      where: {
        userId: user.id,
        completedAt: { not: null },
      },
      select: {
        score: true,
      },
    });

    const averageScore = totalTests > 0
      ? testAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalTests
      : 0;

    const bestScore = totalTests > 0
      ? Math.max(...testAttempts.map(a => a.score || 0))
      : 0;

    res.json({
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
      stats: {
        totalTests,
        averageScore: Math.round(averageScore * 10) / 10,
        bestScore,
        achievementsCount: user.userAchievements.length,
      },
      achievements: user.userAchievements.map(ua => ({
        id: ua.achievement.id,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        points: ua.achievement.points,
        unlockedAt: ua.unlockedAt,
      })),
      recentTests: user.testAttempts.map(ta => ({
        score: ta.score,
        subject: ta.test.subject,
        completedAt: ta.completedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    const { name, status, currentGrade, desiredDirection, motivation, avatar, bio, isPublic } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(status && { status }),
        ...(currentGrade && { currentGrade }),
        ...(desiredDirection && { desiredDirection }),
        ...(motivation !== undefined && { motivation }),
        ...(avatar !== undefined && { avatar }),
        ...(bio !== undefined && { bio }),
        ...(isPublic !== undefined && { isPublic }),
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
        bio: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function updateAvatar(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    const { avatar } = req.body;

    if (!avatar) {
      throw new AppError('Аватар не указан', 400);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar },
      select: {
        id: true,
        avatar: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function updatePrivacy(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    const { isPublic } = req.body;

    if (typeof isPublic !== 'boolean') {
      throw new AppError('Некорректное значение приватности', 400);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isPublic },
      select: {
        id: true,
        isPublic: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function searchUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.length < 2) {
      res.json([]);
      return;
    }

    const users = await prisma.user.findMany({
      where: {
        isPublic: true,
        OR: [
          { username: { contains: q } },
          { name: { contains: q } },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        currentGrade: true,
      },
      take: 10,
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;

    const testAttempts = await prisma.testAttempt.findMany({
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

    const totalTests = testAttempts.length;
    const averageScore =
      totalTests > 0
        ? testAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / totalTests
        : 0;
    const bestScore = totalTests > 0 ? Math.max(...testAttempts.map((a) => a.score || 0)) : 0;

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

    Object.keys(statsBySubject).forEach((subject) => {
      statsBySubject[subject].averageScore =
        statsBySubject[subject].totalScore / statsBySubject[subject].totalAttempts;
    });

    const recentAttempts = testAttempts.slice(0, 10).map((attempt) => ({
      id: attempt.id,
      testId: attempt.testId,
      subject: attempt.test.subject,
      score: attempt.score,
      completedAt: attempt.completedAt,
    }));

    // Calculate daily activity (last 49 days)
    const dailyActivity: Record<string, { count: number; totalScore: number }> = {};
    const now = new Date();

    for (let i = 0; i < 49; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyActivity[dateKey] = { count: 0, totalScore: 0 };
    }

    testAttempts.forEach((attempt) => {
      if (attempt.completedAt) {
        const dateKey = attempt.completedAt.toISOString().split('T')[0];
        if (dailyActivity[dateKey]) {
          dailyActivity[dateKey].count++;
          dailyActivity[dateKey].totalScore += attempt.score || 0;
        }
      }
    });

    const dailyActivityArray = Object.keys(dailyActivity)
      .sort()
      .map((date) => ({
        date,
        count: dailyActivity[date].count,
        avgScore: dailyActivity[date].count > 0
          ? Math.round((dailyActivity[date].totalScore / dailyActivity[date].count) * 10) / 10
          : 0,
      }));

    // Calculate time heatmap (by hour)
    const timeHeatmap: Record<number, { count: number; totalScore: number }> = {};
    for (let i = 0; i < 24; i++) {
      timeHeatmap[i] = { count: 0, totalScore: 0 };
    }

    testAttempts.forEach((attempt) => {
      if (attempt.completedAt) {
        const hour = attempt.completedAt.getHours();
        timeHeatmap[hour].count++;
        timeHeatmap[hour].totalScore += attempt.score || 0;
      }
    });

    const timeHeatmapArray = Object.keys(timeHeatmap).map((hour) => ({
      hour: parseInt(hour),
      testCount: timeHeatmap[parseInt(hour)].count,
      avgScore: timeHeatmap[parseInt(hour)].count > 0
        ? Math.round((timeHeatmap[parseInt(hour)].totalScore / timeHeatmap[parseInt(hour)].count) * 10) / 10
        : 0,
    }));

    // Calculate platform average
    const allAttempts = await prisma.testAttempt.findMany({
      where: { completedAt: { not: null } },
      select: { score: true },
    });
    const platformAverage = allAttempts.length > 0
      ? Math.round((allAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / allAttempts.length) * 10) / 10
      : 0;

    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedDates = Object.keys(dailyActivity)
      .sort()
      .reverse()
      .filter((date) => dailyActivity[date].count > 0);

    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (i === 0) {
        const diff = Math.floor((today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diff <= 1) {
          currentStreak = 1;
          tempStreak = 1;
        } else {
          break;
        }
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const diff = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

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

    // Calculate total time spent (estimate: 2 minutes per question)
    const totalTimeSpent = testAttempts.reduce((sum, attempt) => {
      const questionCount = attempt.test.questions?.length || 10;
      return sum + (questionCount * 2); // 2 minutes per question
    }, 0);

    // Calculate weekly progress
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekAttempts = testAttempts.filter((a) => a.completedAt && a.completedAt >= weekAgo);
    const lastWeekAttempts = testAttempts.filter((a) => {
      if (!a.completedAt) return false;
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      return a.completedAt >= twoWeeksAgo && a.completedAt < weekAgo;
    });

    const thisWeekAvg = thisWeekAttempts.length > 0
      ? thisWeekAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / thisWeekAttempts.length
      : 0;
    const lastWeekAvg = lastWeekAttempts.length > 0
      ? lastWeekAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / lastWeekAttempts.length
      : 0;
    const weeklyProgress = lastWeekAvg > 0 ? Math.round((thisWeekAvg - lastWeekAvg) * 10) / 10 : 0;

    // Find favorite subject
    let favoriteSubject = 'MATHEMATICS';
    let maxAttempts = 0;
    Object.entries(statsBySubject).forEach(([subject, stats]: [string, any]) => {
      if (stats.totalAttempts > maxAttempts) {
        maxAttempts = stats.totalAttempts;
        favoriteSubject = subject;
      }
    });

    // ==========================================
    // REAL AI PREDICTION ALGORITHM
    // ==========================================
    let predictedScore = averageScore;
    let predictionConfidence = 0;
    let predictionFactors: string[] = [];

    if (totalTests >= 3) {
      // 1. Calculate trend using weighted moving average
      const recentScores = testAttempts.slice(0, Math.min(20, totalTests)).map(a => a.score || 0);

      // Exponential weighted moving average (more recent = more weight)
      let weightedSum = 0;
      let weightTotal = 0;
      recentScores.forEach((score, i) => {
        const weight = Math.exp(-i * 0.15); // Exponential decay
        weightedSum += score * weight;
        weightTotal += weight;
      });
      const weightedAvg = weightedSum / weightTotal;

      // 2. Calculate momentum (rate of change)
      const first5Avg = recentScores.slice(0, 5).reduce((a, b) => a + b, 0) / Math.min(5, recentScores.length);
      const last5Avg = recentScores.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, recentScores.length);
      const momentum = first5Avg - last5Avg; // Positive = improving

      // 3. Calculate consistency (standard deviation)
      const variance = recentScores.reduce((sum, s) => sum + Math.pow(s - averageScore, 2), 0) / recentScores.length;
      const stdDev = Math.sqrt(variance);
      const consistency = Math.max(0, 100 - stdDev * 2); // Higher = more consistent

      // 4. Frequency factor (study regularity)
      const daysWithActivity = Object.values(dailyActivity).filter((d: any) => d.count > 0).length;
      const frequencyFactor = Math.min(1, daysWithActivity / 30); // 0-1 based on active days

      // 5. Recent performance boost
      const last3Avg = recentScores.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, recentScores.length);
      const recentBoost = (last3Avg - averageScore) * 0.3;

      // Combine factors for prediction
      predictedScore = weightedAvg + momentum * 0.5 + recentBoost;

      // Apply frequency bonus (regular practice = better prediction)
      predictedScore += frequencyFactor * 5;

      // Apply consistency factor
      if (consistency > 70) {
        predictedScore += 3;
        predictionFactors.push('Стабильные результаты');
      }

      // Calculate confidence based on data quality
      predictionConfidence = Math.min(95,
        50 + // Base confidence
        (totalTests >= 10 ? 20 : totalTests * 2) + // More tests = more confidence
        (consistency > 60 ? 15 : 0) + // Consistent scores = more confidence
        (frequencyFactor * 10) // Regular practice = more confidence
      );

      // Add prediction factors
      if (momentum > 5) predictionFactors.push('Положительная динамика');
      if (momentum < -5) predictionFactors.push('Требуется больше практики');
      if (frequencyFactor > 0.5) predictionFactors.push('Регулярные занятия');
      if (currentStreak >= 3) predictionFactors.push(`Серия ${currentStreak} дней`);

      // Clamp between realistic bounds
      predictedScore = Math.max(averageScore - 15, Math.min(100, predictedScore));
      predictedScore = Math.round(predictedScore * 10) / 10;
    }

    // ==========================================
    // REAL WEAK TOPICS ANALYSIS
    // ==========================================
    const weakTopics: { topic: string; subject: string; avgScore: number; totalAttempts: number; wrongAnswers: number }[] = [];

    // Get detailed attempt data with questions
    const detailedAttempts = await prisma.testAttempt.findMany({
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

    // Analyze answers by topic
    const topicStats: Record<string, { correct: number; total: number; subject: string }> = {};

    detailedAttempts.forEach((attempt) => {
      try {
        const answers = JSON.parse(attempt.answers || '[]');
        const questionsOrder = attempt.questionsOrder ? JSON.parse(attempt.questionsOrder) : null;

        attempt.test.questions.forEach((tq, index) => {
          const question = tq.question;
          const topic = question.topic || 'Общие вопросы';
          const subject = question.subject;
          const topicKey = `${subject}:${topic}`;

          if (!topicStats[topicKey]) {
            topicStats[topicKey] = { correct: 0, total: 0, subject };
          }

          topicStats[topicKey].total++;

          // Find the answer for this question
          const questionIndex = questionsOrder
            ? questionsOrder.indexOf(question.id)
            : index;

          if (questionIndex >= 0 && answers[questionIndex]) {
            const userAnswer = answers[questionIndex];
            let correctAnswer = question.correctAnswer;

            try {
              correctAnswer = JSON.parse(correctAnswer);
            } catch {}

            // Check if answer is correct
            const isCorrect = Array.isArray(correctAnswer)
              ? correctAnswer.includes(userAnswer) || JSON.stringify(correctAnswer) === JSON.stringify(userAnswer)
              : String(correctAnswer).toLowerCase().trim() === String(userAnswer).toLowerCase().trim();

            if (isCorrect) {
              topicStats[topicKey].correct++;
            }
          }
        });
      } catch (e) {
        // Skip invalid data
      }
    });

    // Convert to weak topics array (topics with < 70% success rate)
    Object.entries(topicStats).forEach(([key, stats]) => {
      if (stats.total >= 2) { // At least 2 attempts
        const avgScore = Math.round((stats.correct / stats.total) * 100);
        const [subject, topic] = key.split(':');

        if (avgScore < 70) { // Below 70% is considered weak
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

    // Sort by avgScore ascending (weakest first)
    weakTopics.sort((a, b) => a.avgScore - b.avgScore);

    // ==========================================
    // REAL COMPARISON WITH OTHER USERS
    // ==========================================
    // Get all users' stats for comparison
    const allUsersStats = await prisma.user.findMany({
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

    // Calculate each user's average
    const userAverages = allUsersStats.map((u) => {
      const scores = u.testAttempts.map((t) => t.score || 0);
      return {
        id: u.id,
        avg: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
        tests: scores.length,
      };
    });

    // Calculate percentile
    const usersBelow = userAverages.filter((u) => u.avg < averageScore).length;
    const percentile = userAverages.length > 1
      ? Math.round((usersBelow / (userAverages.length - 1)) * 100)
      : 50;

    // Calculate users beaten (excluding self)
    const usersBeaten = usersBelow;
    const totalUsers = userAverages.length;

    // Find user's rank
    const sortedByAvg = [...userAverages].sort((a, b) => b.avg - a.avg);
    const userRank = sortedByAvg.findIndex((u) => u.id === userId) + 1;

    res.json({
      totalTests,
      averageScore: Math.round(averageScore * 10) / 10,
      bestScore,
      statsBySubject: Object.values(statsBySubject),
      recentAttempts,
      dailyActivity: dailyActivityArray,
      timeHeatmap: timeHeatmapArray,
      platformAverage,
      currentStreak,
      longestStreak,
      totalTimeSpent,
      weeklyProgress,
      favoriteSubject,
      // AI Prediction
      predictedScore,
      predictionConfidence,
      predictionFactors,
      // Weak Topics
      weakTopics: weakTopics.slice(0, 5), // Top 5 weakest topics
      // Comparison with others
      percentile,
      usersBeaten,
      totalUsers,
      userRank,
    });
  } catch (error) {
    next(error);
  }
}

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

export async function getLeaderboard(req: Request, res: Response, next: NextFunction) {
  try {
    const { period = 'all', subject, limit = '50' } = req.query;

    let dateFilter = {};
    const now = new Date();

    if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { completedAt: { gte: weekAgo } };
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { completedAt: { gte: monthAgo } };
    }

    const usersWithStats = await prisma.user.findMany({
      where: {
        isPublic: true,
        testAttempts: {
          some: {
            completedAt: { not: null },
            ...dateFilter,
            ...(subject && typeof subject === 'string' ? { test: { subject } } : {}),
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
            ...(subject && typeof subject === 'string' ? { test: { subject } } : {}),
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

    const leaderboard = usersWithStats.map(user => {
      const totalTests = user.testAttempts.length;
      const totalScore = user.testAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
      const averageScore = totalTests > 0 ? totalScore / totalTests : 0;
      const bestScore = totalTests > 0 ? Math.max(...user.testAttempts.map(a => a.score || 0)) : 0;
      const achievementsCount = user.userAchievements.length;

      const points = Math.round(
        (totalTests * 10) +
        (averageScore * 5) +
        (bestScore * 2) +
        (achievementsCount * 50)
      );

      return {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        currentGrade: user.currentGrade,
        stats: {
          totalTests,
          averageScore: Math.round(averageScore * 10) / 10,
          bestScore,
          achievementsCount,
          points,
        },
      };
    });

    leaderboard.sort((a, b) => b.stats.points - a.stats.points);

    const rankedLeaderboard = leaderboard.slice(0, parseInt(limit as string)).map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    res.json({
      period,
      subject: subject || 'all',
      total: rankedLeaderboard.length,
      leaderboard: rankedLeaderboard,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserRank(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new AppError('Не авторизован', 401);
    }

    const currentUser = await prisma.user.findUnique({
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
      throw new AppError('Пользователь не найден', 404);
    }

    const userTests = currentUser.testAttempts.length;
    const userAvgScore = userTests > 0
      ? currentUser.testAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / userTests
      : 0;
    const userBestScore = userTests > 0
      ? Math.max(...currentUser.testAttempts.map(a => a.score || 0))
      : 0;
    const userAchievements = currentUser.userAchievements.length;

    const userPoints = Math.round(
      (userTests * 10) +
      (userAvgScore * 5) +
      (userBestScore * 2) +
      (userAchievements * 50)
    );

    const higherRankedCount = await prisma.$queryRaw<{ count: bigint }[]>`
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

    const rank = Number(higherRankedCount[0]?.count || 0) + 1;

    res.json({
      rank,
      points: userPoints,
      stats: {
        totalTests: userTests,
        averageScore: Math.round(userAvgScore * 10) / 10,
        bestScore: userBestScore,
        achievementsCount: userAchievements,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Детальный анализ ошибок
export async function getErrorAnalysis(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new AppError('Не авторизован', 401);
    }

    const analysis = await errorAnalysisService.getDetailedAnalysis(userId);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
}

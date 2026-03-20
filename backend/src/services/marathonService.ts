import prisma from '../config/database';

interface MarathonQuestion {
  id: string;
  question: string;
  options: string[] | null;
  type: string;
  topic: string | null;
  difficulty: string;
  subject: string;
}

interface AnswerResult {
  isCorrect: boolean;
  correctAnswer: string;
  newDifficulty: string;
  mistakes: number;
  score: number;
  streak: number;
  questionsAnswered: number;
  isGameOver: boolean;
}

interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  name: string;
  score: number;
  questionsAnswered: number;
  maxStreak: number;
  difficulty: string;
  startedAt: Date;
  endedAt: Date | null;
}

interface RunStats {
  score: number;
  questionsAnswered: number;
  mistakes: number;
  maxStreak: number;
  difficulty: string;
  startedAt: Date;
  endedAt: Date | null;
}

class MarathonService {
  private static instance: MarathonService;
  private currentStreaks: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): MarathonService {
    if (!MarathonService.instance) {
      MarathonService.instance = new MarathonService();
    }
    return MarathonService.instance;
  }

  public calculateDifficulty(correctInRow: number): string {
    if (correctInRow >= 6) return 'HARD';
    if (correctInRow >= 3) return 'MEDIUM';
    return 'EASY';
  }

  public async getNextQuestion(
    subject: string,
    currentDifficulty: string,
    answeredIds: string[]
  ): Promise<MarathonQuestion | null> {
    const whereClause: Record<string, unknown> = {
      subject,
      difficulty: currentDifficulty,
    };

    if (answeredIds.length > 0) {
      whereClause.id = { notIn: answeredIds };
    }

    // Try to find a question at current difficulty
    let question = await prisma.question.findFirst({
      where: whereClause,
      select: {
        id: true,
        question: true,
        options: true,
        type: true,
        topic: true,
        difficulty: true,
        subject: true,
      },
      orderBy: { createdAt: 'asc' },
      skip: Math.floor(Math.random() * (await prisma.question.count({ where: whereClause }))),
    });

    // Fallback: try any difficulty if no questions at current level
    if (!question) {
      const fallbackWhere: Record<string, unknown> = { subject };
      if (answeredIds.length > 0) {
        fallbackWhere.id = { notIn: answeredIds };
      }

      const count = await prisma.question.count({ where: fallbackWhere });
      if (count === 0) return null;

      question = await prisma.question.findFirst({
        where: fallbackWhere,
        select: {
          id: true,
          question: true,
          options: true,
          type: true,
          topic: true,
          difficulty: true,
          subject: true,
        },
        orderBy: { createdAt: 'asc' },
        skip: Math.floor(Math.random() * count),
      });
    }

    if (!question) return null;

    return {
      ...question,
      options: question.options ? JSON.parse(question.options) as string[] : null,
    };
  }

  public async startRun(userId: string, subject: string): Promise<{ runId: string; firstQuestion: MarathonQuestion | null }> {
    const run = await prisma.marathonRun.create({
      data: {
        userId,
        subject,
        score: 0,
        questionsAnswered: 0,
        mistakes: 0,
        maxStreak: 0,
        difficulty: 'EASY',
      },
    });

    this.currentStreaks.set(run.id, 0);

    const firstQuestion = await this.getNextQuestion(subject, 'EASY', []);

    return { runId: run.id, firstQuestion };
  }

  public async submitAnswer(
    runId: string,
    questionId: string,
    answer: string,
    answeredIds: string[]
  ): Promise<AnswerResult & { nextQuestion: MarathonQuestion | null }> {
    const run = await prisma.marathonRun.findUnique({ where: { id: runId } });
    if (!run) throw new Error('Marathon run not found');
    if (run.endedAt) throw new Error('Marathon run already ended');

    // Get question and check answer
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { correctAnswer: true },
    });

    if (!question) throw new Error('Question not found');

    const isCorrect = this.checkAnswer(answer, question.correctAnswer);

    let currentStreak = this.currentStreaks.get(runId) || 0;
    let newScore = run.score;
    let newMistakes = run.mistakes;
    let newMaxStreak = run.maxStreak;
    let isGameOver = false;

    if (isCorrect) {
      currentStreak++;
      // Score: base 10 + streak bonus + difficulty bonus
      const difficultyBonus = run.difficulty === 'HARD' ? 15 : run.difficulty === 'MEDIUM' ? 10 : 5;
      const streakBonus = Math.min(currentStreak * 2, 20);
      newScore += 10 + difficultyBonus + streakBonus;
      newMaxStreak = Math.max(newMaxStreak, currentStreak);
    } else {
      currentStreak = 0;
      newMistakes++;
      if (newMistakes >= 3) {
        isGameOver = true;
      }
    }

    this.currentStreaks.set(runId, currentStreak);

    const newDifficulty = this.calculateDifficulty(currentStreak);
    const questionsAnswered = run.questionsAnswered + 1;

    const updateData: Record<string, unknown> = {
      score: newScore,
      questionsAnswered,
      mistakes: newMistakes,
      maxStreak: newMaxStreak,
      difficulty: newDifficulty,
    };

    if (isGameOver) {
      updateData.endedAt = new Date();
      this.currentStreaks.delete(runId);
    }

    await prisma.marathonRun.update({
      where: { id: runId },
      data: updateData,
    });

    let nextQuestion: MarathonQuestion | null = null;
    if (!isGameOver) {
      const allAnswered = [...answeredIds, questionId];
      nextQuestion = await this.getNextQuestion(run.subject, newDifficulty, allAnswered);
      if (!nextQuestion) {
        // No more questions available - end the run
        isGameOver = true;
        await prisma.marathonRun.update({
          where: { id: runId },
          data: { endedAt: new Date() },
        });
        this.currentStreaks.delete(runId);
      }
    }

    return {
      isCorrect,
      correctAnswer: question.correctAnswer,
      newDifficulty,
      mistakes: newMistakes,
      score: newScore,
      streak: currentStreak,
      questionsAnswered,
      isGameOver,
      nextQuestion,
    };
  }

  public async endRun(runId: string): Promise<RunStats> {
    const run = await prisma.marathonRun.findUnique({ where: { id: runId } });
    if (!run) throw new Error('Marathon run not found');

    if (!run.endedAt) {
      await prisma.marathonRun.update({
        where: { id: runId },
        data: { endedAt: new Date() },
      });
    }

    this.currentStreaks.delete(runId);

    return {
      score: run.score,
      questionsAnswered: run.questionsAnswered,
      mistakes: run.mistakes,
      maxStreak: run.maxStreak,
      difficulty: run.difficulty,
      startedAt: run.startedAt,
      endedAt: run.endedAt || new Date(),
    };
  }

  public async getLeaderboard(subject: string, limit: number = 10): Promise<LeaderboardEntry[]> {
    const runs = await prisma.marathonRun.findMany({
      where: { subject, endedAt: { not: null } },
      orderBy: { score: 'desc' },
      take: limit,
    });

    // Fetch user info for each run
    const userIds = [...new Set(runs.map(r => r.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, name: true },
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    return runs.map(run => {
      const user = userMap.get(run.userId);
      return {
        id: run.id,
        userId: run.userId,
        username: user?.username || 'Unknown',
        name: user?.name || 'Unknown',
        score: run.score,
        questionsAnswered: run.questionsAnswered,
        maxStreak: run.maxStreak,
        difficulty: run.difficulty,
        startedAt: run.startedAt,
        endedAt: run.endedAt,
      };
    });
  }

  public async getMyBest(userId: string, subject?: string): Promise<RunStats[]> {
    const where: Record<string, unknown> = { userId, endedAt: { not: null } };
    if (subject) where.subject = subject;

    const runs = await prisma.marathonRun.findMany({
      where,
      orderBy: { score: 'desc' },
      take: 5,
      select: {
        score: true,
        questionsAnswered: true,
        mistakes: true,
        maxStreak: true,
        difficulty: true,
        startedAt: true,
        endedAt: true,
      },
    });

    return runs;
  }

  private checkAnswer(userAnswer: string, correctAnswer: string): boolean {
    const normalize = (s: string): string => s.trim().toLowerCase().replace(/\s+/g, ' ');

    // Try parsing as JSON array for multiple-choice
    try {
      const correctArr = JSON.parse(correctAnswer) as unknown;
      if (Array.isArray(correctArr)) {
        const userArr = (() => {
          try {
            return JSON.parse(userAnswer) as unknown;
          } catch {
            return null;
          }
        })();
        if (Array.isArray(userArr)) {
          const sortedCorrect = [...correctArr].map(String).sort();
          const sortedUser = [...userArr].map(String).sort();
          return JSON.stringify(sortedCorrect) === JSON.stringify(sortedUser);
        }
        // Single answer matching one of correct answers
        return correctArr.map(String).map(normalize).includes(normalize(userAnswer));
      }
    } catch {
      // Not JSON, compare as strings
    }

    return normalize(userAnswer) === normalize(correctAnswer);
  }
}

export const marathonService = MarathonService.getInstance();
export default marathonService;

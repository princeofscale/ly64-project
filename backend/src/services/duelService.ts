import { randomBytes } from 'crypto';

import prisma from '../config/database';
import notificationService from './notificationService';
import { wsService } from './websocketService';

interface DuelQuestion {
  id: string;
  question: string;
  options: string[] | null;
  type: string;
  topic: string | null;
}

interface DuelInfo {
  id: string;
  code: string;
  subject: string;
  status: string;
  creatorId: string;
  opponentId: string | null;
  questionsCount: number;
  timePerQuestion: number;
  creatorScore: number | null;
  opponentScore: number | null;
  winnerId: string | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date;
}

class DuelService {
  private static instance: DuelService;

  private constructor() {}

  public static getInstance(): DuelService {
    if (!DuelService.instance) {
      DuelService.instance = new DuelService();
    }
    return DuelService.instance;
  }

  private generateCode(): string {
    return randomBytes(3).toString('hex').toUpperCase();
  }

  public async createDuel(
    userId: string,
    subject: string,
    questionsCount: number = 10,
    timePerQuestion: number = 30
  ): Promise<{ duel: DuelInfo; code: string }> {
    const code = this.generateCode();

    const duel = await prisma.duel.create({
      data: {
        code,
        subject,
        status: 'waiting',
        creatorId: userId,
        questionsCount: Math.min(Math.max(questionsCount, 5), 20),
        timePerQuestion: Math.min(Math.max(timePerQuestion, 10), 60),
        questions: '[]',
      },
    });

    return {
      duel: this.formatDuel(duel),
      code: duel.code,
    };
  }

  public async joinByCode(userId: string, code: string): Promise<{ duel: DuelInfo }> {
    const duel = await prisma.duel.findUnique({ where: { code: code.toUpperCase() } });

    if (!duel) throw new Error('Дуэль не найдена');
    if (duel.status !== 'waiting') throw new Error('Дуэль уже началась или завершена');
    if (duel.creatorId === userId) throw new Error('Нельзя присоединиться к своей дуэли');

    const updated = await prisma.duel.update({
      where: { id: duel.id },
      data: { opponentId: userId },
    });

    // Notify creator that opponent joined
    wsService.sendToUser(duel.creatorId, 'duel_opponent_joined', {
      duelId: duel.id,
      opponentId: userId,
    });

    return { duel: this.formatDuel(updated) };
  }

  public async findRandomOpponent(userId: string, subject: string): Promise<{ duel: DuelInfo | null; queued: boolean }> {
    // Look for a waiting duel with same subject
    const existingDuel = await prisma.duel.findFirst({
      where: {
        subject,
        status: 'waiting',
        creatorId: { not: userId },
        opponentId: null,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (existingDuel) {
      const updated = await prisma.duel.update({
        where: { id: existingDuel.id },
        data: { opponentId: userId },
      });

      // Notify creator
      wsService.sendToUser(existingDuel.creatorId, 'duel_opponent_joined', {
        duelId: existingDuel.id,
        opponentId: userId,
      });

      void notificationService.create(
        existingDuel.creatorId,
        'duel',
        'Оппонент найден!',
        'К вашей дуэли присоединился соперник. Начинайте!',
        { duelId: existingDuel.id }
      );

      return { duel: this.formatDuel(updated), queued: false };
    }

    // No waiting duel found — create one
    const { duel } = await this.createDuel(userId, subject);
    return { duel, queued: true };
  }

  public async startDuel(duelId: string): Promise<{ questions: DuelQuestion[] }> {
    const duel = await prisma.duel.findUnique({ where: { id: duelId } });
    if (!duel) throw new Error('Дуэль не найдена');
    if (duel.status !== 'waiting') throw new Error('Дуэль уже началась');
    if (!duel.opponentId) throw new Error('Ожидание оппонента');

    // Select random questions
    const questions = await prisma.question.findMany({
      where: { subject: duel.subject },
      select: {
        id: true,
        question: true,
        options: true,
        type: true,
        topic: true,
      },
      take: duel.questionsCount * 3,
    });

    // Shuffle and take required count
    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, duel.questionsCount);
    const questionIds = shuffled.map(q => q.id);

    await prisma.duel.update({
      where: { id: duelId },
      data: {
        status: 'active',
        questions: JSON.stringify(questionIds),
        startedAt: new Date(),
        creatorAnswers: '[]',
        opponentAnswers: '[]',
        creatorScore: 0,
        opponentScore: 0,
      },
    });

    const formattedQuestions: DuelQuestion[] = shuffled.map(q => ({
      ...q,
      options: q.options ? JSON.parse(q.options) as string[] : null,
    }));

    // Send questions to both players
    wsService.sendToUser(duel.creatorId, 'duel_start', {
      duelId,
      questions: formattedQuestions,
      timePerQuestion: duel.timePerQuestion,
    });
    wsService.sendToUser(duel.opponentId, 'duel_start', {
      duelId,
      questions: formattedQuestions,
      timePerQuestion: duel.timePerQuestion,
    });

    return { questions: formattedQuestions };
  }

  public async submitDuelAnswer(
    duelId: string,
    userId: string,
    questionId: string,
    answer: string,
    timeMs: number
  ): Promise<{ isCorrect: boolean; score: number }> {
    const duel = await prisma.duel.findUnique({ where: { id: duelId } });
    if (!duel) throw new Error('Дуэль не найдена');
    if (duel.status !== 'active') throw new Error('Дуэль не активна');

    const isCreator = userId === duel.creatorId;
    const isOpponent = userId === duel.opponentId;
    if (!isCreator && !isOpponent) throw new Error('Вы не участник этой дуэли');

    // Check answer
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { correctAnswer: true },
    });

    if (!question) throw new Error('Вопрос не найден');

    const isCorrect = this.checkAnswer(answer, question.correctAnswer);
    const points = isCorrect ? Math.max(1, Math.floor((30000 - Math.min(timeMs, 30000)) / 3000) + 1) : 0;

    // Update answers and score
    const answersField = isCreator ? 'creatorAnswers' : 'opponentAnswers';
    const scoreField = isCreator ? 'creatorScore' : 'opponentScore';
    const currentAnswers = JSON.parse((isCreator ? duel.creatorAnswers : duel.opponentAnswers) || '[]') as Array<{
      questionId: string;
      answer: string;
      timeMs: number;
      correct: boolean;
    }>;

    currentAnswers.push({ questionId, answer, timeMs, correct: isCorrect });
    const currentScore = (isCreator ? duel.creatorScore : duel.opponentScore) || 0;

    await prisma.duel.update({
      where: { id: duelId },
      data: {
        [answersField]: JSON.stringify(currentAnswers),
        [scoreField]: currentScore + points,
      },
    });

    // Notify opponent
    const opponentUserId = isCreator ? duel.opponentId : duel.creatorId;
    if (opponentUserId) {
      wsService.sendToUser(opponentUserId, 'duel_opponent_answered', {
        duelId,
        questionId,
        questionIndex: currentAnswers.length - 1,
      });
    }

    // Check if duel is complete
    const questionIds = JSON.parse(duel.questions) as string[];
    const otherAnswers = JSON.parse(
      (isCreator ? duel.opponentAnswers : duel.creatorAnswers) || '[]'
    ) as unknown[];

    if (currentAnswers.length >= questionIds.length && otherAnswers.length >= questionIds.length) {
      await this.finishDuel(duelId);
    }

    return { isCorrect, score: currentScore + points };
  }

  public async finishDuel(duelId: string): Promise<void> {
    const duel = await prisma.duel.findUnique({ where: { id: duelId } });
    if (!duel) return;

    const creatorScore = duel.creatorScore || 0;
    const opponentScore = duel.opponentScore || 0;

    let winnerId: string | null = null;
    if (creatorScore > opponentScore) winnerId = duel.creatorId;
    else if (opponentScore > creatorScore) winnerId = duel.opponentId;

    await prisma.duel.update({
      where: { id: duelId },
      data: {
        status: 'finished',
        finishedAt: new Date(),
        winnerId,
      },
    });

    // Notify both players
    const result = {
      duelId,
      creatorScore,
      opponentScore,
      winnerId,
    };

    wsService.sendToUser(duel.creatorId, 'duel_result', result);
    if (duel.opponentId) {
      wsService.sendToUser(duel.opponentId, 'duel_result', result);
    }

    // Create persistent notifications for both players
    const resultText = winnerId
      ? (winnerId === duel.creatorId ? 'Вы победили!' : 'Вы проиграли')
      : 'Ничья!';
    const opponentResultText = winnerId
      ? (winnerId === duel.opponentId ? 'Вы победили!' : 'Вы проиграли')
      : 'Ничья!';

    void notificationService.create(
      duel.creatorId,
      'duel',
      'Дуэль завершена',
      `${resultText} Счёт: ${creatorScore}:${opponentScore}`,
      { duelId }
    );
    if (duel.opponentId) {
      void notificationService.create(
        duel.opponentId,
        'duel',
        'Дуэль завершена',
        `${opponentResultText} Счёт: ${opponentScore}:${creatorScore}`,
        { duelId }
      );
    }
  }

  public async getDuel(duelId: string): Promise<DuelInfo | null> {
    const duel = await prisma.duel.findUnique({ where: { id: duelId } });
    return duel ? this.formatDuel(duel) : null;
  }

  public async getDuelHistory(userId: string): Promise<DuelInfo[]> {
    const duels = await prisma.duel.findMany({
      where: {
        OR: [{ creatorId: userId }, { opponentId: userId }],
        status: 'finished',
      },
      orderBy: { finishedAt: 'desc' },
      take: 20,
    });

    return duels.map(d => this.formatDuel(d));
  }

  private formatDuel(duel: {
    id: string;
    code: string;
    subject: string;
    status: string;
    creatorId: string;
    opponentId: string | null;
    questionsCount: number;
    timePerQuestion: number;
    creatorScore: number | null;
    opponentScore: number | null;
    winnerId: string | null;
    startedAt: Date | null;
    finishedAt: Date | null;
    createdAt: Date;
  }): DuelInfo {
    return {
      id: duel.id,
      code: duel.code,
      subject: duel.subject,
      status: duel.status,
      creatorId: duel.creatorId,
      opponentId: duel.opponentId,
      questionsCount: duel.questionsCount,
      timePerQuestion: duel.timePerQuestion,
      creatorScore: duel.creatorScore,
      opponentScore: duel.opponentScore,
      winnerId: duel.winnerId,
      startedAt: duel.startedAt,
      finishedAt: duel.finishedAt,
      createdAt: duel.createdAt,
    };
  }

  private checkAnswer(userAnswer: string, correctAnswer: string): boolean {
    const normalize = (s: string): string => s.trim().toLowerCase().replace(/\s+/g, ' ');
    try {
      const correctArr = JSON.parse(correctAnswer) as unknown;
      if (Array.isArray(correctArr)) {
        return correctArr.map(String).map(normalize).includes(normalize(userAnswer));
      }
    } catch {
      // Not JSON
    }
    return normalize(userAnswer) === normalize(correctAnswer);
  }
}

export const duelService = DuelService.getInstance();
export default duelService;

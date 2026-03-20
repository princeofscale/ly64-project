import prisma from '../config/database';

interface AddCardInput {
  questionId?: string;
  flashcardId?: string;
  front: string;
  back: string;
  subject: string;
}

interface SRSStats {
  dueToday: number;
  totalCards: number;
  bySubject: Array<{ subject: string; total: number; due: number }>;
}

class SRSService {
  private static instance: SRSService;

  private constructor() {}

  public static getInstance(): SRSService {
    if (!SRSService.instance) {
      SRSService.instance = new SRSService();
    }
    return SRSService.instance;
  }

  /**
   * SM-2 algorithm implementation.
   * quality: 0-5 (0=complete failure, 5=perfect)
   */
  public async reviewCard(cardId: string, userId: string, quality: number): Promise<void> {
    const card = await prisma.sRSCard.findFirst({
      where: { id: cardId, userId },
    });
    if (!card) throw new Error('Card not found');

    quality = Math.max(0, Math.min(5, Math.round(quality)));

    let { easeFactor, interval, repetitions } = card;

    if (quality < 3) {
      // Failed — reset
      repetitions = 0;
      interval = 0;
    } else {
      // Success
      repetitions += 1;
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
    }

    // Update ease factor
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    await prisma.sRSCard.update({
      where: { id: cardId },
      data: {
        easeFactor,
        interval,
        repetitions,
        nextReview,
        lastReview: new Date(),
      },
    });
  }

  public async addCard(userId: string, input: AddCardInput): Promise<{ id: string }> {
    // Check for duplicates
    if (input.questionId) {
      const existing = await prisma.sRSCard.findUnique({
        where: { userId_questionId: { userId, questionId: input.questionId } },
      });
      if (existing) return { id: existing.id };
    }
    if (input.flashcardId) {
      const existing = await prisma.sRSCard.findUnique({
        where: { userId_flashcardId: { userId, flashcardId: input.flashcardId } },
      });
      if (existing) return { id: existing.id };
    }

    const card = await prisma.sRSCard.create({
      data: {
        userId,
        questionId: input.questionId || null,
        flashcardId: input.flashcardId || null,
        front: input.front,
        back: input.back,
        subject: input.subject,
      },
    });

    return { id: card.id };
  }

  public async getDueCards(userId: string, subject?: string, limit = 20) {
    return prisma.sRSCard.findMany({
      where: {
        userId,
        nextReview: { lte: new Date() },
        ...(subject ? { subject } : {}),
      },
      orderBy: { nextReview: 'asc' },
      take: limit,
    });
  }

  public async getStats(userId: string): Promise<SRSStats> {
    const now = new Date();

    const [dueToday, totalCards, allCards] = await Promise.all([
      prisma.sRSCard.count({ where: { userId, nextReview: { lte: now } } }),
      prisma.sRSCard.count({ where: { userId } }),
      prisma.sRSCard.findMany({
        where: { userId },
        select: { subject: true, nextReview: true },
      }),
    ]);

    // Aggregate by subject
    const subjectMap = new Map<string, { total: number; due: number }>();
    for (const card of allCards) {
      const entry = subjectMap.get(card.subject) || { total: 0, due: 0 };
      entry.total += 1;
      if (card.nextReview <= now) entry.due += 1;
      subjectMap.set(card.subject, entry);
    }

    const bySubject = Array.from(subjectMap.entries()).map(([subject, stats]) => ({
      subject,
      ...stats,
    }));

    return { dueToday, totalCards, bySubject };
  }

  public async addFromWrongAnswers(userId: string, attemptId: string): Promise<{ added: number }> {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          include: {
            questions: {
              include: { question: true },
            },
          },
        },
      },
    });

    if (!attempt) throw new Error('Test attempt not found');
    if (attempt.userId !== userId) throw new Error('Not authorized');

    const answers: Array<{ questionId: string; answer: string }> = JSON.parse(attempt.answers);
    let added = 0;

    for (const testQuestion of attempt.test.questions) {
      const q = testQuestion.question;
      const userAnswer = answers.find(a => a.questionId === q.id);

      // Check if answer is wrong
      let isCorrect = false;
      if (userAnswer) {
        const correctAnswer = q.correctAnswer;
        try {
          const correctArr = JSON.parse(correctAnswer) as unknown;
          if (Array.isArray(correctArr)) {
            isCorrect = correctArr.map(String).map(s => s.trim().toLowerCase())
              .includes(userAnswer.answer.trim().toLowerCase());
          } else {
            isCorrect = userAnswer.answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
          }
        } catch {
          isCorrect = userAnswer.answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
        }
      }

      if (!isCorrect) {
        try {
          await this.addCard(userId, {
            questionId: q.id,
            front: q.question,
            back: q.correctAnswer,
            subject: q.subject,
          });
          added++;
        } catch {
          // Duplicate, skip
        }
      }
    }

    return { added };
  }
}

export default SRSService.getInstance();

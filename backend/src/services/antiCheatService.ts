import prisma from '../config/database';

const MIN_ANSWER_TIME_MS = 2000;
const SUSPICIOUS_FAST_ANSWERS_THRESHOLD = 3;

interface AnswerData {
  questionId: string;
  answer: string | string[];
  timeSpent: number;
  timestamp: number;
}

interface SuspiciousAnalysis {
  isSuspicious: boolean;
  reasons: string[];
  fastAnswersCount: number;
  averageTimeMs: number;
}

export class AntiCheatService {
  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async getRandomizedQuestions(testId: string) {
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          include: { question: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!test) return null;

    let questions = test.questions.map((tq) => ({
      id: tq.question.id,
      question: tq.question.question,
      type: tq.question.type,
      difficulty: tq.question.difficulty,
      options: tq.question.options ? JSON.parse(tq.question.options) : null,
      topic: tq.question.topic,
      order: tq.order, // Preserve original order from sdamgia
    }));

    if (test.randomizeQuestions) {
      questions = this.shuffleArray(questions);

      questions = questions.map((q) => {
        if (q.options && Array.isArray(q.options)) {
          return { ...q, options: this.shuffleArray(q.options) };
        }
        return q;
      });
    }

    return {
      test: {
        id: test.id,
        title: test.title,
        timeLimit: test.timeLimit,
        preventBackNavigation: test.preventBackNavigation,
        questionsCount: questions.length,
      },
      questions,
      questionsOrder: questions.map((q) => q.id),
    };
  }

  analyzeAnswerTimes(answerTimes: number[]): SuspiciousAnalysis {
    const reasons: string[] = [];
    let fastAnswersCount = 0;

    for (const time of answerTimes) {
      if (time < MIN_ANSWER_TIME_MS) {
        fastAnswersCount++;
      }
    }

    const averageTimeMs =
      answerTimes.length > 0
        ? answerTimes.reduce((a, b) => a + b, 0) / answerTimes.length
        : 0;

    if (fastAnswersCount >= SUSPICIOUS_FAST_ANSWERS_THRESHOLD) {
      reasons.push(
        `${fastAnswersCount} ответов даны слишком быстро (менее ${MIN_ANSWER_TIME_MS / 1000} сек)`
      );
    }

    if (averageTimeMs < MIN_ANSWER_TIME_MS && answerTimes.length > 3) {
      reasons.push(
        `Среднее время ответа слишком низкое: ${(averageTimeMs / 1000).toFixed(1)} сек`
      );
    }

    return {
      isSuspicious: reasons.length > 0,
      reasons,
      fastAnswersCount,
      averageTimeMs,
    };
  }

  async submitTestWithAntiCheat(
    userId: string,
    testId: string,
    answers: AnswerData[],
    questionsOrder: string[]
  ) {
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: { include: { question: true } },
      },
    });

    if (!test) throw new Error('Test not found');

    const answerTimes = answers.map((a) => a.timeSpent);
    const analysis = this.analyzeAnswerTimes(answerTimes);

    let correctCount = 0;
    const questionResults = [];

    // Sort questions by order to match frontend display
    const sortedQuestions = test.questions.sort((a, b) => a.order - b.order);

    for (const testQuestion of sortedQuestions) {
      const answer = answers.find((a) => a.questionId === testQuestion.question.id);

      // Try to parse correctAnswer as JSON, fallback to raw string
      let correctAnswer: any;
      try {
        correctAnswer = JSON.parse(testQuestion.question.correctAnswer);
      } catch {
        correctAnswer = testQuestion.question.correctAnswer;
      }

      let isCorrect = false;
      if (answer) {
        if (Array.isArray(answer.answer) && Array.isArray(correctAnswer)) {
          isCorrect =
            answer.answer.length === correctAnswer.length &&
            answer.answer.every((a) => correctAnswer.includes(a));
        } else {
          isCorrect =
            String(answer.answer).toLowerCase().trim() ===
            String(correctAnswer).toLowerCase().trim();
        }
      }

      if (isCorrect) correctCount++;

      questionResults.push({
        questionId: testQuestion.question.id,
        number: testQuestion.order + 1,
        userAnswer: answer?.answer || null,
        correctAnswer,
        isCorrect,
        points: isCorrect ? 1 : 0, // TODO: get actual points from question
        topic: testQuestion.question.topic,
      });
    }

    const score = Math.round((correctCount / test.questions.length) * 100);

    const attempt = await prisma.testAttempt.create({
      data: {
        userId,
        testId,
        answers: JSON.stringify(answers),
        questionsOrder: JSON.stringify(questionsOrder),
        answerTimes: JSON.stringify(answerTimes),
        score,
        suspiciousFlag: analysis.isSuspicious,
        suspiciousReason: analysis.reasons.join('; ') || null,
        completedAt: new Date(),
      },
    });

    return {
      attempt,
      score,
      correctCount,
      totalQuestions: test.questions.length,
      analysis: analysis.isSuspicious ? analysis : null,
      questionResults, // Detailed results for each question
    };
  }
}

export default new AntiCheatService();

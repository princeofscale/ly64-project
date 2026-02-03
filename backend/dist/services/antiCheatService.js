'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AntiCheatService = void 0;
const database_1 = require('../config/database');
const MIN_ANSWER_TIME_MS = 2000;
const SUSPICIOUS_FAST_ANSWERS_THRESHOLD = 3;
class AntiCheatService {
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  async getRandomizedQuestions(testId) {
    const test = await database_1.prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          include: { question: true },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!test) return null;
    let questions = test.questions.map(tq => ({
      id: tq.question.id,
      question: tq.question.question,
      type: tq.question.type,
      difficulty: tq.question.difficulty,
      options: tq.question.options ? JSON.parse(tq.question.options) : null,
      topic: tq.question.topic,
    }));
    if (test.randomizeQuestions) {
      questions = this.shuffleArray(questions);
      questions = questions.map(q => {
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
      questionsOrder: questions.map(q => q.id),
    };
  }
  analyzeAnswerTimes(answerTimes) {
    const reasons = [];
    let fastAnswersCount = 0;
    for (const time of answerTimes) {
      if (time < MIN_ANSWER_TIME_MS) {
        fastAnswersCount++;
      }
    }
    const averageTimeMs =
      answerTimes.length > 0 ? answerTimes.reduce((a, b) => a + b, 0) / answerTimes.length : 0;
    if (fastAnswersCount >= SUSPICIOUS_FAST_ANSWERS_THRESHOLD) {
      reasons.push(
        `${fastAnswersCount} ответов даны слишком быстро (менее ${MIN_ANSWER_TIME_MS / 1000} сек)`
      );
    }
    if (averageTimeMs < MIN_ANSWER_TIME_MS && answerTimes.length > 3) {
      reasons.push(`Среднее время ответа слишком низкое: ${(averageTimeMs / 1000).toFixed(1)} сек`);
    }
    return {
      isSuspicious: reasons.length > 0,
      reasons,
      fastAnswersCount,
      averageTimeMs,
    };
  }
  async submitTestWithAntiCheat(userId, testId, answers, questionsOrder) {
    const test = await database_1.prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: { include: { question: true } },
      },
    });
    if (!test) throw new Error('Test not found');
    const answerTimes = answers.map(a => a.timeSpent);
    const analysis = this.analyzeAnswerTimes(answerTimes);
    let correctCount = 0;
    for (const answer of answers) {
      const testQuestion = test.questions.find(tq => tq.question.id === answer.questionId);
      if (!testQuestion) continue;
      const correctAnswer = JSON.parse(testQuestion.question.correctAnswer);
      if (Array.isArray(answer.answer) && Array.isArray(correctAnswer)) {
        const isCorrect =
          answer.answer.length === correctAnswer.length &&
          answer.answer.every(a => correctAnswer.includes(a));
        if (isCorrect) correctCount++;
      } else if (
        String(answer.answer).toLowerCase().trim() === String(correctAnswer).toLowerCase().trim()
      ) {
        correctCount++;
      }
    }
    const score = Math.round((correctCount / test.questions.length) * 100);
    const attempt = await database_1.prisma.testAttempt.create({
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
    };
  }
}
exports.AntiCheatService = AntiCheatService;
exports.default = new AntiCheatService();
//# sourceMappingURL=antiCheatService.js.map

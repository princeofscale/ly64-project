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
export declare class AntiCheatService {
  shuffleArray<T>(array: T[]): T[];
  getRandomizedQuestions(testId: string): Promise<{
    test: {
      id: any;
      title: any;
      timeLimit: any;
      preventBackNavigation: any;
      questionsCount: any;
    };
    questions: any;
    questionsOrder: any;
  } | null>;
  analyzeAnswerTimes(answerTimes: number[]): SuspiciousAnalysis;
  submitTestWithAntiCheat(
    userId: string,
    testId: string,
    answers: AnswerData[],
    questionsOrder: string[]
  ): Promise<{
    attempt: any;
    score: number;
    correctCount: number;
    totalQuestions: any;
    analysis: SuspiciousAnalysis | null;
  }>;
}
declare const _default: AntiCheatService;
export default _default;
//# sourceMappingURL=antiCheatService.d.ts.map

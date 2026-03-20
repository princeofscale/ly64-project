import api, { testApi } from './api';

export interface TestQuestion {
  id: string;
  number: number;
  text: string;
  type: 'short' | 'choice' | 'matching' | 'multiple_choice' | 'detailed' | 'proof';
  options?: string[];
  correctAnswer: string;
  points: number;
  topic: string;
  explanation?: string;
}

export interface Test {
  id: string;
  title: string;
  description?: string;
  subject: string;
  examType: string;
  targetGrade?: string;
  timeLimit?: number;
  questions: TestQuestion[];
  duration: number;
}

export interface TestVariant {
  testId: string;
  subject: string;
  grade: number;
  examType: string;
  duration: number;
  tasks: TestQuestion[];
}

interface ApiQuestion {
  id: string;
  question: string;
  type: string;
  options?: string | string[];
  correctAnswer: string;
  topic?: string;
  explanation?: string;
  order?: number;
}

interface ApiTest {
  id: string;
  title: string;
  description?: string;
  subject: string;
  examType: string;
  targetGrade?: string;
  timeLimit?: number;
  questions: ApiQuestion[];
}

class TestService {
  private static readonly MAX_CACHE_SIZE = 20;
  private testCache: Map<string, Test> = new Map();

  async getTests(params?: {
    subject?: string;
    examType?: string;
    isDiagnostic?: boolean;
  }): Promise<Test[]> {
    try {
      const response = await testApi.getTests(params);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch {
      return [];
    }
  }

  async getTestById(testId: string): Promise<Test | null> {
    try {
      if (this.testCache.has(testId)) {
        return this.testCache.get(testId)!;
      }

      const response = await testApi.startTest(testId);
      if (response.success && response.data) {
        const test = this.mapApiTestToTest(response.data);
        if (this.testCache.size >= TestService.MAX_CACHE_SIZE) {
          const firstKey = this.testCache.keys().next().value;
          if (firstKey) this.testCache.delete(firstKey);
        }
        this.testCache.set(testId, test);
        return test;
      }
      return null;
    } catch {
      return null;
    }
  }

  async getTestVariant(
    subject: string,
    examType: string,
    grade?: number
  ): Promise<TestVariant | null> {
    try {
      const tests = await this.getTests({ subject, examType });

      if (tests.length === 0) {
        return null;
      }

      const test = tests[0];
      if (!test) {
        return null;
      }
      const fullTest = await this.getTestById(test.id);

      if (!fullTest) {
        return null;
      }

      return {
        testId: fullTest.id,
        subject: fullTest.subject,
        grade: grade || this.extractGradeFromTest(fullTest),
        examType: fullTest.examType,
        duration: fullTest.duration,
        tasks: fullTest.questions,
      };
    } catch {
      return null;
    }
  }

  async submitTest(
    testId: string,
    answers: Array<{ questionId: string; answer: string }>,
    questionsOrder: string[]
  ) {
    try {
      const response = await testApi.submitTest(testId, answers, questionsOrder);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getTestResults(testId: string) {
    try {
      const response = await testApi.getTestResults(testId);
      return response;
    } catch (error) {
      throw error;
    }
  }

  private mapApiTestToTest(apiTest: ApiTest): Test {
    const sortedQuestions = [...(apiTest.questions || [])].sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : 999;
      const orderB = b.order !== undefined ? b.order : 999;
      return orderA - orderB;
    });

    const questions: TestQuestion[] = sortedQuestions.map((q, index) => {
      let options: string[] | undefined;
      if (q.options) {
        if (typeof q.options === 'string') {
          try {
            options = JSON.parse(q.options);
          } catch {
            options = [q.options];
          }
        } else if (Array.isArray(q.options)) {
          options = q.options;
        }
      }

      let correctAnswer = q.correctAnswer;
      if (typeof correctAnswer === 'string' && correctAnswer.startsWith('"')) {
        try {
          correctAnswer = JSON.parse(correctAnswer);
        } catch {
        }
      }

      return {
        id: q.id,
        number: index + 1,
        text: q.question,
        type: this.mapQuestionType(q.type),
        options,
        correctAnswer,
        points: 1,
        topic: q.topic || 'Общая тема',
        explanation: q.explanation,
      };
    });

    return {
      id: apiTest.id,
      title: apiTest.title,
      description: apiTest.description,
      subject: apiTest.subject,
      examType: apiTest.examType,
      targetGrade: apiTest.targetGrade,
      timeLimit: apiTest.timeLimit,
      questions,
      duration: apiTest.timeLimit ? Math.floor(apiTest.timeLimit / 60) : 235,
    };
  }

  private mapQuestionType(backendType: string): TestQuestion['type'] {
    const typeMap: Record<string, TestQuestion['type']> = {
      SHORT_ANSWER: 'short',
      SINGLE_CHOICE: 'choice',
      MULTIPLE_CHOICE: 'multiple_choice',
      MATCHING: 'matching',
      DETAILED: 'detailed',
      PROOF: 'proof',
    };
    return typeMap[backendType] || 'short';
  }

  private extractGradeFromTest(test: Test): number {
    if (test.targetGrade) {
      const match = test.targetGrade.match(/GRADE_(\d+)/);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
    return test.examType === 'OGE' ? 9 : 11;
  }

  async getLatestAttemptId(testId: string): Promise<string | null> {
    try {
      const response = await api.get(`/tests/${testId}/results`);
      if (response.data.success && response.data.data) {
        // Return the most recent attempt ID
        const attempts = response.data.data;
        if (Array.isArray(attempts) && attempts.length > 0) {
          return attempts[0].id;
        }
        if (attempts.id) return attempts.id;
      }
      return null;
    } catch {
      return null;
    }
  }

  clearCache() {
    this.testCache.clear();
  }
}

export const testService = new TestService();
export default testService;

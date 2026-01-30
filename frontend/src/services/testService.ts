import { testApi } from './api';

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
  duration: number; // in minutes
}

export interface TestVariant {
  testId: string;
  subject: string;
  grade: number;
  examType: string;
  duration: number;
  tasks: TestQuestion[];
}

class TestService {
  private testCache: Map<string, Test> = new Map();

  /**
   * Get all available tests with optional filters
   */
  async getTests(params?: {
    subject?: string;
    examType?: string;
    isDiagnostic?: boolean;
  }): Promise<Test[]> {
    try {
      console.log('🌐 getTests API call with params:', params);
      const response = await testApi.getTests(params);
      console.log('📡 getTests API response:', response);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('❌ Error fetching tests:', error);
      return [];
    }
  }

  /**
   * Get a test by ID and start it (returns randomized questions)
   */
  async getTestById(testId: string): Promise<Test | null> {
    try {
      // Check cache first
      if (this.testCache.has(testId)) {
        return this.testCache.get(testId)!;
      }

      const response = await testApi.startTest(testId);
      if (response.success && response.data) {
        const test = this.mapApiTestToTest(response.data);
        this.testCache.set(testId, test);
        return test;
      }
      return null;
    } catch (error) {
      console.error('Error fetching test:', error);
      return null;
    }
  }

  /**
   * Get a test variant for a specific grade and exam type
   */
  async getTestVariant(
    subject: string,
    examType: string,
    grade?: number
  ): Promise<TestVariant | null> {
    try {
      const targetGrade = grade ? `GRADE_${grade}` : undefined;
      console.log('🔍 getTestVariant called:', { subject, examType, grade, targetGrade });
      const tests = await this.getTests({ subject, examType });
      console.log('📋 Tests received:', tests);

      if (tests.length === 0) {
        console.warn('⚠️ No tests found for', { subject, examType });
        return null;
      }

      // Get the first matching test
      const test = tests[0];
      const fullTest = await this.getTestById(test.id);

      if (!fullTest) {
        return null;
      }

      // Convert to TestVariant format
      return {
        testId: fullTest.id,
        subject: fullTest.subject,
        grade: grade || this.extractGradeFromTest(fullTest),
        examType: fullTest.examType,
        duration: fullTest.duration,
        tasks: fullTest.questions,
      };
    } catch (error) {
      console.error('Error fetching test variant:', error);
      return null;
    }
  }

  /**
   * Submit test answers
   */
  async submitTest(
    testId: string,
    answers: Array<{ questionId: string; answer: string }>,
    questionsOrder: string[]
  ) {
    try {
      const response = await testApi.submitTest(testId, answers, questionsOrder);
      return response;
    } catch (error) {
      console.error('Error submitting test:', error);
      throw error;
    }
  }

  /**
   * Get test results
   */
  async getTestResults(testId: string) {
    try {
      const response = await testApi.getTestResults(testId);
      return response;
    } catch (error) {
      console.error('Error fetching test results:', error);
      throw error;
    }
  }

  /**
   * Map API test data to frontend Test format
   */
  private mapApiTestToTest(apiTest: any): Test {
    // Sort questions by order field to preserve original sequence
    const sortedQuestions = (apiTest.questions || []).sort((a: any, b: any) => {
      const orderA = a.order !== undefined ? a.order : 999;
      const orderB = b.order !== undefined ? b.order : 999;
      return orderA - orderB;
    });

    const questions: TestQuestion[] = sortedQuestions.map((q: any, index: number) => {
      // Parse options - could be string or already parsed array
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

      // Parse correctAnswer - could be string or JSON string
      let correctAnswer = q.correctAnswer;
      if (typeof correctAnswer === 'string' && correctAnswer.startsWith('"')) {
        try {
          correctAnswer = JSON.parse(correctAnswer);
        } catch {
          // Keep as is
        }
      }

      return {
        id: q.id,
        number: index + 1,
        text: q.question,
        type: this.mapQuestionType(q.type),
        options,
        correctAnswer,
        points: 1, // Default points, can be calculated based on difficulty
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
      duration: apiTest.timeLimit ? Math.floor(apiTest.timeLimit / 60) : 235, // Convert to minutes
    };
  }

  /**
   * Map backend question type to frontend type
   */
  private mapQuestionType(backendType: string): TestQuestion['type'] {
    const typeMap: Record<string, TestQuestion['type']> = {
      'SHORT_ANSWER': 'short',
      'SINGLE_CHOICE': 'choice',
      'MULTIPLE_CHOICE': 'multiple_choice',
      'MATCHING': 'matching',
      'DETAILED': 'detailed',
      'PROOF': 'proof',
    };
    return typeMap[backendType] || 'short';
  }

  /**
   * Extract grade from test
   */
  private extractGradeFromTest(test: Test): number {
    if (test.targetGrade) {
      const match = test.targetGrade.match(/GRADE_(\d+)/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    // Default grade based on exam type
    return test.examType === 'OGE' ? 9 : 11;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.testCache.clear();
  }
}

export const testService = new TestService();
export default testService;

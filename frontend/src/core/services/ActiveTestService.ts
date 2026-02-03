import type { ExamType, Subject, Grade } from '../types';

export interface ActiveTestData {
  id: string;
  examType: ExamType;
  subject: Subject;
  grade: Grade;
  title: string;
  startedAt: string;
  currentTaskIndex: number;
  answeredCount: number;
  totalTasks: number;
  timeLeftSeconds: number;
  route: string;
}

const ACTIVE_TEST_KEY = 'lyceum64_active_test';

export class ActiveTestService {
  private static instance: ActiveTestService;

  private constructor() {}

  public static getInstance(): ActiveTestService {
    if (!ActiveTestService.instance) {
      ActiveTestService.instance = new ActiveTestService();
    }
    return ActiveTestService.instance;
  }

  public startTest(data: Omit<ActiveTestData, 'id'>): string {
    const id = crypto.randomUUID();
    const activeTest: ActiveTestData = { ...data, id };
    localStorage.setItem(ACTIVE_TEST_KEY, JSON.stringify(activeTest));
    return id;
  }

  public getActiveTest(): ActiveTestData | null {
    try {
      const data = localStorage.getItem(ACTIVE_TEST_KEY);
      if (!data) return null;
      return JSON.parse(data) as ActiveTestData;
    } catch {
      return null;
    }
  }

  public hasActiveTest(): boolean {
    return this.getActiveTest() !== null;
  }

  public updateProgress(
    updates: Partial<Pick<ActiveTestData, 'currentTaskIndex' | 'answeredCount' | 'timeLeftSeconds'>>
  ): void {
    const activeTest = this.getActiveTest();
    if (!activeTest) return;

    const updated = { ...activeTest, ...updates };
    localStorage.setItem(ACTIVE_TEST_KEY, JSON.stringify(updated));
  }

  public completeTest(): void {
    localStorage.removeItem(ACTIVE_TEST_KEY);
  }

  public abandonTest(): void {
    localStorage.removeItem(ACTIVE_TEST_KEY);
  }

  public getTimeSinceStart(): number | null {
    const activeTest = this.getActiveTest();
    if (!activeTest) return null;

    const startedAt = new Date(activeTest.startedAt);
    return Math.floor((Date.now() - startedAt.getTime()) / 1000);
  }

  public isTestExpired(maxDurationSeconds: number): boolean {
    const timeSinceStart = this.getTimeSinceStart();
    if (timeSinceStart === null) return false;
    return timeSinceStart >= maxDurationSeconds;
  }
}

export const getActiveTestService = (): ActiveTestService => {
  return ActiveTestService.getInstance();
};

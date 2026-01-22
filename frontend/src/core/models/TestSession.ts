import { v4 as uuidv4 } from 'uuid';
import { ITestSession, IExam, ITask } from '../interfaces';
import { TestStatus, UserAnswer, TestResults } from '../types';

export class TestSession implements ITestSession {
  public readonly id: string;
  public readonly exam: IExam;
  public readonly startedAt: Date;
  public status: TestStatus;

  private currentTaskIndex: number = 0;
  private answers: Map<number, UserAnswer> = new Map();
  private pausedAt: Date | null = null;
  private totalPausedTime: number = 0;

  constructor(exam: IExam) {
    this.id = uuidv4();
    this.exam = exam;
    this.startedAt = new Date();
    this.status = 'in_progress';
  }

  public getCurrentTask(): ITask | undefined {
    return this.exam.tasks[this.currentTaskIndex];
  }

  public setCurrentTaskIndex(index: number): void {
    if (index >= 0 && index < this.exam.tasks.length) {
      this.currentTaskIndex = index;
    }
  }

  public getCurrentTaskIndex(): number {
    return this.currentTaskIndex;
  }

  public nextTask(): boolean {
    if (this.currentTaskIndex < this.exam.tasks.length - 1) {
      this.currentTaskIndex++;
      return true;
    }
    return false;
  }

  public previousTask(): boolean {
    if (this.currentTaskIndex > 0) {
      this.currentTaskIndex--;
      return true;
    }
    return false;
  }

  public goToTask(taskNumber: number): boolean {
    const index = this.exam.tasks.findIndex(t => t.number === taskNumber);
    if (index !== -1) {
      this.currentTaskIndex = index;
      return true;
    }
    return false;
  }

  public submitAnswer(taskNumber: number, answer: string): void {
    this.answers.set(taskNumber, {
      taskNumber,
      value: answer,
      timestamp: new Date(),
      status: answer.trim() ? 'answered' : 'skipped',
    });
  }

  public getAnswer(taskNumber: number): UserAnswer | undefined {
    return this.answers.get(taskNumber);
  }

  public getAllAnswers(): Map<number, UserAnswer> {
    return new Map(this.answers);
  }

  public skipTask(taskNumber: number): void {
    const existing = this.answers.get(taskNumber);
    this.answers.set(taskNumber, {
      taskNumber,
      value: existing?.value || '',
      timestamp: new Date(),
      status: 'skipped',
    });
  }

  public flagTask(taskNumber: number): void {
    const existing = this.answers.get(taskNumber);
    if (existing) {
      existing.status = existing.status === 'flagged' ? 'answered' : 'flagged';
    } else {
      this.answers.set(taskNumber, {
        taskNumber,
        value: '',
        timestamp: new Date(),
        status: 'flagged',
      });
    }
  }

  public getProgress(): number {
    return Math.round((this.getAnsweredCount() / this.exam.tasks.length) * 100);
  }

  public getAnsweredCount(): number {
    return Array.from(this.answers.values()).filter(
      a => a.status === 'answered' || a.status === 'flagged'
    ).length;
  }

  public getSkippedCount(): number {
    return Array.from(this.answers.values()).filter(
      a => a.status === 'skipped'
    ).length;
  }

  public getFlaggedCount(): number {
    return Array.from(this.answers.values()).filter(
      a => a.status === 'flagged'
    ).length;
  }

  public getUnansweredTasks(): ITask[] {
    return this.exam.tasks.filter(task => {
      const answer = this.answers.get(task.number);
      return !answer || answer.status === 'unanswered' || !answer.value.trim();
    });
  }

  public pause(): void {
    if (this.status === 'in_progress') {
      this.status = 'paused';
      this.pausedAt = new Date();
    }
  }

  public resume(): void {
    if (this.status === 'paused' && this.pausedAt) {
      this.status = 'in_progress';
      this.totalPausedTime += Date.now() - this.pausedAt.getTime();
      this.pausedAt = null;
    }
  }

  public complete(): TestResults {
    this.status = 'completed';

    let correctAnswers = 0;
    let earnedPoints = 0;

    this.exam.tasks.forEach(task => {
      const answer = this.answers.get(task.number);
      if (answer && answer.value) {
        const result = task.validate(answer.value);
        if (result.isCorrect) {
          correctAnswers++;
          earnedPoints += result.earnedPoints;
        }
      }
    });

    const timeSpent = this.calculateTimeSpent();

    return {
      totalTasks: this.exam.tasks.length,
      answeredTasks: this.getAnsweredCount(),
      correctAnswers,
      earnedPoints,
      maxPoints: this.exam.maxPoints,
      percentageScore: Math.round((earnedPoints / this.exam.maxPoints) * 100),
      timeSpent,
      completedAt: new Date(),
    };
  }

  public expireTime(): TestResults {
    this.status = 'time_expired';
    return this.complete();
  }

  private calculateTimeSpent(): number {
    const now = Date.now();
    const totalTime = now - this.startedAt.getTime();
    const activeTime = totalTime - this.totalPausedTime;
    return Math.floor(activeTime / 1000);
  }

  public getTimeSpent(): number {
    return this.calculateTimeSpent();
  }

  public isCurrentTask(taskNumber: number): boolean {
    const currentTask = this.getCurrentTask();
    return currentTask?.number === taskNumber;
  }

  public isTaskAnswered(taskNumber: number): boolean {
    const answer = this.answers.get(taskNumber);
    return !!answer && !!answer.value.trim();
  }

  public isFirstTask(): boolean {
    return this.currentTaskIndex === 0;
  }

  public isLastTask(): boolean {
    return this.currentTaskIndex === this.exam.tasks.length - 1;
  }

  public serialize(): string {
    return JSON.stringify({
      id: this.id,
      examId: this.exam.id,
      startedAt: this.startedAt.toISOString(),
      status: this.status,
      currentTaskIndex: this.currentTaskIndex,
      answers: Array.from(this.answers.entries()),
      totalPausedTime: this.totalPausedTime,
    });
  }

  public static deserialize(data: string, exam: IExam): TestSession {
    const parsed = JSON.parse(data);
    const session = new TestSession(exam);

    (session as any).id = parsed.id;
    (session as any).startedAt = new Date(parsed.startedAt);
    session.status = parsed.status;
    session.currentTaskIndex = parsed.currentTaskIndex;
    (session as any).totalPausedTime = parsed.totalPausedTime;

    parsed.answers.forEach(([key, value]: [number, UserAnswer]) => {
      session.answers.set(key, {
        ...value,
        timestamp: new Date(value.timestamp),
      });
    });

    return session;
  }
}

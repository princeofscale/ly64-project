import type {
  QuestionType,
  ExamType,
  Subject,
  Grade,
  TestStatus,
  ValidationResult,
  TimerState,
  TestResults,
  UserAnswer,
} from '../types';

export interface ITask {
  readonly id: string;
  readonly number: number;
  readonly text: string;
  readonly type: QuestionType;
  readonly options: string[] | null;
  readonly correctAnswer: string;
  readonly points: number;
  readonly topic: string;
  readonly requiresDetailedSolution: boolean;
  readonly requiresProof: boolean;

  validate(answer: string): ValidationResult;
  getDisplayText(): string;
}

export interface IExam {
  readonly id: string;
  readonly subject: Subject;
  readonly grade: Grade;
  readonly examType: ExamType;
  readonly duration: number;
  readonly tasks: ITask[];
  readonly title: string;
  readonly maxPoints: number;

  getTask(number: number): ITask | undefined;
  getTaskCount(): number;
  getDurationInSeconds(): number;
}

export interface ITestSession {
  readonly id: string;
  readonly exam: IExam;
  readonly startedAt: Date;
  status: TestStatus;

  getCurrentTask(): ITask | undefined;
  setCurrentTaskIndex(index: number): void;
  getCurrentTaskIndex(): number;

  submitAnswer(taskNumber: number, answer: string): void;
  getAnswer(taskNumber: number): UserAnswer | undefined;
  getAllAnswers(): Map<number, UserAnswer>;

  getProgress(): number;
  getAnsweredCount(): number;

  complete(): TestResults;
  pause(): void;
  resume(): void;
}

export interface ITimerService {
  start(durationSeconds: number): void;
  pause(): void;
  resume(): void;
  stop(): void;
  reset(durationSeconds: number): void;
  getState(): TimerState;
  onTick(callback: (state: TimerState) => void): () => void;
  onComplete(callback: () => void): () => void;
}

export interface IStorageService {
  save<T>(key: string, value: T): void;
  load<T>(key: string): T | null;
  remove(key: string): void;
  clear(): void;
  exists(key: string): boolean;
}

export interface IAnswerValidationStrategy {
  validate(userAnswer: string, correctAnswer: string): boolean;
  normalize(answer: string): string;
}

export interface IExamFactory {
  create(examType: ExamType, subject: Subject, grade: Grade): IExam;
  getAvailableExamTypes(subject: Subject, grade: Grade): ExamType[];
}

export interface IObserver<T> {
  update(data: T): void;
}

export interface IObservable<T> {
  subscribe(observer: IObserver<T>): () => void;
  notify(data: T): void;
}

export interface IQuestionRenderer {
  canRender(type: QuestionType): boolean;
  render(task: ITask, currentAnswer: string, onAnswer: (answer: string) => void): React.ReactNode;
}

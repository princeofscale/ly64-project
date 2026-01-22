/**
 * Core Interfaces
 * Контракты для всех основных сущностей приложения
 */

import {
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

/**
 * Интерфейс задания
 */
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

/**
 * Интерфейс экзамена
 */
export interface IExam {
  readonly id: string;
  readonly subject: Subject;
  readonly grade: Grade;
  readonly examType: ExamType;
  readonly duration: number; // в минутах
  readonly tasks: ITask[];
  readonly title: string;
  readonly maxPoints: number;

  getTask(number: number): ITask | undefined;
  getTaskCount(): number;
  getDurationInSeconds(): number;
}

/**
 * Интерфейс сессии теста
 */
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

/**
 * Интерфейс сервиса таймера
 */
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

/**
 * Интерфейс сервиса хранения
 */
export interface IStorageService {
  save<T>(key: string, value: T): void;
  load<T>(key: string): T | null;
  remove(key: string): void;
  clear(): void;
  exists(key: string): boolean;
}

/**
 * Интерфейс стратегии валидации ответа
 */
export interface IAnswerValidationStrategy {
  validate(userAnswer: string, correctAnswer: string): boolean;
  normalize(answer: string): string;
}

/**
 * Интерфейс фабрики экзаменов
 */
export interface IExamFactory {
  create(examType: ExamType, subject: Subject, grade: Grade): IExam;
  getAvailableExamTypes(subject: Subject, grade: Grade): ExamType[];
}

/**
 * Интерфейс наблюдателя (Observer pattern)
 */
export interface IObserver<T> {
  update(data: T): void;
}

/**
 * Интерфейс субъекта наблюдения (Observable)
 */
export interface IObservable<T> {
  subscribe(observer: IObserver<T>): () => void;
  notify(data: T): void;
}

/**
 * Интерфейс рендерера вопроса
 */
export interface IQuestionRenderer {
  canRender(type: QuestionType): boolean;
  render(task: ITask, currentAnswer: string, onAnswer: (answer: string) => void): React.ReactNode;
}

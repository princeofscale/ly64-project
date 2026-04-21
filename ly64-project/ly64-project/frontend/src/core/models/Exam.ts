/**
 * Exam Model
 * Базовый класс экзамена с поддержкой наследования
 */

import { v4 as uuidv4 } from 'uuid';

import { EXAM_CONFIG, SUBJECT_NAMES } from '../constants';

import { Task } from './Task';

import type { IExam, ITask } from '../interfaces';
import type { ExamType, Subject, Grade, ExamDTO } from '../types';

/**
 * Абстрактный базовый класс экзамена
 */
export abstract class BaseExam implements IExam {
  public readonly id: string;
  public readonly subject: Subject;
  public readonly grade: Grade;
  public readonly examType: ExamType;
  public readonly duration: number;
  public readonly tasks: ITask[];

  protected constructor(dto: ExamDTO) {
    this.id = uuidv4();
    this.subject = dto.subject;
    this.grade = dto.grade;
    this.examType = dto.examType;
    this.duration = dto.duration;
    this.tasks = dto.tasks.map(taskDto => new Task(taskDto));
  }

  /**
   * Получить название экзамена
   */
  public get title(): string {
    const config = EXAM_CONFIG[this.examType];
    const subjectName = SUBJECT_NAMES[this.subject];
    return `${config.title} ${subjectName}`;
  }

  /**
   * Получить максимальное количество баллов
   */
  public get maxPoints(): number {
    return this.tasks.reduce((sum, task) => sum + task.points, 0);
  }

  /**
   * Получить задание по номеру
   */
  public getTask(number: number): ITask | undefined {
    return this.tasks.find(task => task.number === number);
  }

  /**
   * Получить количество заданий
   */
  public getTaskCount(): number {
    return this.tasks.length;
  }

  /**
   * Получить продолжительность в секундах
   */
  public getDurationInSeconds(): number {
    return this.duration * 60;
  }

  /**
   * Получить форматированную продолжительность
   */
  public getFormattedDuration(): string {
    const hours = Math.floor(this.duration / 60);
    const minutes = this.duration % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours} ч ${minutes} мин`;
    } else if (hours > 0) {
      return `${hours} ч`;
    }
    return `${minutes} мин`;
  }

  /**
   * Получить задания по теме
   */
  public getTasksByTopic(topic: string): ITask[] {
    return this.tasks.filter(task => task.topic === topic);
  }

  /**
   * Получить уникальные темы
   */
  public getTopics(): string[] {
    return [...new Set(this.tasks.map(task => task.topic))];
  }

  /**
   * Абстрактный метод для получения описания экзамена
   */
  public abstract getDescription(): string;
}

/**
 * ОГЭ по математике
 */
export class OGEMathExam extends BaseExam {
  constructor(dto: ExamDTO) {
    super({
      ...dto,
      examType: 'OGE',
      duration: EXAM_CONFIG.OGE.duration,
    });
  }

  public getDescription(): string {
    return `Основной государственный экзамен по математике для 9 класса.
            Включает ${this.getTaskCount()} заданий.
            Максимум ${this.maxPoints} баллов.`;
  }
}

/**
 * ЕГЭ профильного уровня по математике
 */
export class EGEProfileMathExam extends BaseExam {
  constructor(dto: ExamDTO) {
    super({
      ...dto,
      examType: 'EGE_PROFILE',
      duration: EXAM_CONFIG.EGE_PROFILE.duration,
    });
  }

  public getDescription(): string {
    return `Единый государственный экзамен по математике профильного уровня.
            Включает ${this.getTaskCount()} заданий повышенной сложности.
            Максимум ${this.maxPoints} первичных баллов.`;
  }

  /**
   * Получить задания первой части (1-12)
   */
  public getFirstPartTasks(): ITask[] {
    return this.tasks.filter(task => task.number <= 12);
  }

  /**
   * Получить задания второй части (13-19)
   */
  public getSecondPartTasks(): ITask[] {
    return this.tasks.filter(task => task.number > 12);
  }
}

/**
 * ЕГЭ базового уровня по математике
 */
export class EGEBaseMathExam extends BaseExam {
  constructor(dto: ExamDTO) {
    super({
      ...dto,
      examType: 'EGE_BASE',
      duration: EXAM_CONFIG.EGE_BASE.duration,
    });
  }

  public getDescription(): string {
    return `Единый государственный экзамен по математике базового уровня.
            Включает ${this.getTaskCount()} заданий.
            Оценивается по пятибалльной шкале.`;
  }

  /**
   * Конвертировать первичные баллы в оценку
   */
  public convertToGrade(primaryScore: number): number {
    if (primaryScore >= 17) return 5;
    if (primaryScore >= 12) return 4;
    if (primaryScore >= 7) return 3;
    return 2;
  }
}

/**
 * Обычный тренировочный тест
 */
export class RegularExam extends BaseExam {
  constructor(dto: ExamDTO) {
    super({
      ...dto,
      examType: 'REGULAR',
      duration: dto.duration || EXAM_CONFIG.REGULAR.duration,
    });
  }

  public getDescription(): string {
    return `Тренировочный тест по ${SUBJECT_NAMES[this.subject]} для ${this.grade} класса.
            Включает ${this.getTaskCount()} заданий.`;
  }
}

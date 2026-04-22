import { v4 as uuidv4 } from 'uuid';

import { EXAM_CONFIG, SUBJECT_NAMES } from '../constants';

import { Task } from './Task';

import type { IExam, ITask } from '../interfaces';
import type { ExamType, Subject, Grade, ExamDTO } from '../types';

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

  public get title(): string {
    const config = EXAM_CONFIG[this.examType];
    const subjectName = SUBJECT_NAMES[this.subject];
    return `${config.title} ${subjectName}`;
  }

  public get maxPoints(): number {
    return this.tasks.reduce((sum, task) => sum + task.points, 0);
  }

  public getTask(number: number): ITask | undefined {
    return this.tasks.find(task => task.number === number);
  }

  public getTaskCount(): number {
    return this.tasks.length;
  }

  public getDurationInSeconds(): number {
    return this.duration * 60;
  }

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

  public getTasksByTopic(topic: string): ITask[] {
    return this.tasks.filter(task => task.topic === topic);
  }

  public getTopics(): string[] {
    return [...new Set(this.tasks.map(task => task.topic))];
  }

  public abstract getDescription(): string;
}

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

  public getFirstPartTasks(): ITask[] {
    return this.tasks.filter(task => task.number <= 12);
  }

  public getSecondPartTasks(): ITask[] {
    return this.tasks.filter(task => task.number > 12);
  }
}

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

  public convertToGrade(primaryScore: number): number {
    if (primaryScore >= 17) return 5;
    if (primaryScore >= 12) return 4;
    if (primaryScore >= 7) return 3;
    return 2;
  }
}

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

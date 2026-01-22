import { IExam, IExamFactory } from '../interfaces';
import { ExamType, Subject, Grade, ExamDTO } from '../types';
import {
  OGEMathExam,
  EGEProfileMathExam,
  EGEBaseMathExam,
  RegularExam,
} from '../models';

import { ogeMathVariant } from '../../data/oge-math-variant';
import { egeMathProfile } from '../../data/ege-math-profile';
import { egeMathBase } from '../../data/ege-math-base';

class ExamDataRegistry {
  private static instance: ExamDataRegistry;
  private examData: Map<string, ExamDTO> = new Map();

  private constructor() {
    this.registerDefaultExams();
  }

  public static getInstance(): ExamDataRegistry {
    if (!ExamDataRegistry.instance) {
      ExamDataRegistry.instance = new ExamDataRegistry();
    }
    return ExamDataRegistry.instance;
  }

  private registerDefaultExams(): void {
    this.register('MATHEMATICS', 9, 'OGE', ogeMathVariant as ExamDTO);
    this.register('MATHEMATICS', 11, 'EGE_PROFILE', egeMathProfile as ExamDTO);
    this.register('MATHEMATICS', 11, 'EGE_BASE', egeMathBase as ExamDTO);
  }

  private createKey(subject: Subject, grade: Grade, examType: ExamType): string {
    return `${subject}_${grade}_${examType}`;
  }

  public register(subject: Subject, grade: Grade, examType: ExamType, data: ExamDTO): void {
    const key = this.createKey(subject, grade, examType);
    this.examData.set(key, data);
  }

  public get(subject: Subject, grade: Grade, examType: ExamType): ExamDTO | undefined {
    const key = this.createKey(subject, grade, examType);
    return this.examData.get(key);
  }

  public has(subject: Subject, grade: Grade, examType: ExamType): boolean {
    const key = this.createKey(subject, grade, examType);
    return this.examData.has(key);
  }

  public getAvailableTypes(subject: Subject, grade: Grade): ExamType[] {
    const types: ExamType[] = [];
    const allTypes: ExamType[] = ['OGE', 'EGE_PROFILE', 'EGE_BASE', 'REGULAR'];

    for (const type of allTypes) {
      if (this.has(subject, grade, type)) {
        types.push(type);
      }
    }

    return types;
  }
}

export class ExamFactory implements IExamFactory {
  private static instance: ExamFactory;
  private registry: ExamDataRegistry;

  private constructor() {
    this.registry = ExamDataRegistry.getInstance();
  }

  public static getInstance(): ExamFactory {
    if (!ExamFactory.instance) {
      ExamFactory.instance = new ExamFactory();
    }
    return ExamFactory.instance;
  }

  public create(examType: ExamType, subject: Subject, grade: Grade): IExam {
    const data = this.registry.get(subject, grade, examType);

    if (!data) {
      throw new ExamNotFoundError(
        `Экзамен не найден: ${examType} по ${subject} для ${grade} класса`
      );
    }

    return this.createExamInstance(examType, data);
  }

  private createExamInstance(examType: ExamType, data: ExamDTO): IExam {
    switch (examType) {
      case 'OGE':
        return new OGEMathExam(data);
      case 'EGE_PROFILE':
        return new EGEProfileMathExam(data);
      case 'EGE_BASE':
        return new EGEBaseMathExam(data);
      case 'REGULAR':
      default:
        return new RegularExam(data);
    }
  }

  public getAvailableExamTypes(subject: Subject, grade: Grade): ExamType[] {
    return this.registry.getAvailableTypes(subject, grade);
  }

  public isExamAvailable(examType: ExamType, subject: Subject, grade: Grade): boolean {
    return this.registry.has(subject, grade, examType);
  }

  public registerExam(subject: Subject, grade: Grade, examType: ExamType, data: ExamDTO): void {
    this.registry.register(subject, grade, examType, data);
  }

  public createOGEMath(): IExam {
    return this.create('OGE', 'MATHEMATICS', 9);
  }

  public createEGEProfileMath(): IExam {
    return this.create('EGE_PROFILE', 'MATHEMATICS', 11);
  }

  public createEGEBaseMath(): IExam {
    return this.create('EGE_BASE', 'MATHEMATICS', 11);
  }
}

export class ExamNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExamNotFoundError';
  }
}

export const createExam = (
  examType: ExamType,
  subject: Subject,
  grade: Grade
): IExam => {
  return ExamFactory.getInstance().create(examType, subject, grade);
};

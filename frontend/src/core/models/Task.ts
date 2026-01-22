import { v4 as uuidv4 } from 'uuid';
import { ITask, IAnswerValidationStrategy } from '../interfaces';
import { QuestionType, ValidationResult, TaskDTO } from '../types';
import {
  ShortAnswerStrategy,
  ChoiceAnswerStrategy,
  DetailedAnswerStrategy,
} from '../strategies/AnswerValidationStrategies';

export class Task implements ITask {
  public readonly id: string;
  public readonly number: number;
  public readonly text: string;
  public readonly type: QuestionType;
  public readonly options: string[] | null;
  public readonly correctAnswer: string;
  public readonly points: number;
  public readonly topic: string;
  public readonly requiresDetailedSolution: boolean;
  public readonly requiresProof: boolean;

  private readonly validationStrategy: IAnswerValidationStrategy;

  constructor(dto: TaskDTO) {
    this.id = uuidv4();
    this.number = dto.number;
    this.text = dto.text;
    this.type = dto.type;
    this.options = dto.options ?? null;
    this.correctAnswer = dto.correctAnswer;
    this.points = dto.points;
    this.topic = dto.topic;
    this.requiresDetailedSolution = dto.detailedSolution ?? false;
    this.requiresProof = dto.requiresProof ?? false;

    this.validationStrategy = this.createValidationStrategy();
  }

  private createValidationStrategy(): IAnswerValidationStrategy {
    switch (this.type) {
      case 'choice':
      case 'multiple_choice':
        return new ChoiceAnswerStrategy();
      case 'detailed':
      case 'proof':
        return new DetailedAnswerStrategy();
      case 'short':
      case 'matching':
      default:
        return new ShortAnswerStrategy();
    }
  }

  public validate(answer: string): ValidationResult {
    if (this.requiresDetailedSolution || this.requiresProof) {
      return {
        isCorrect: false,
        earnedPoints: 0,
        maxPoints: this.points,
        feedback: 'Требуется проверка преподавателем',
      };
    }

    const isCorrect = this.validationStrategy.validate(answer, this.correctAnswer);

    return {
      isCorrect,
      earnedPoints: isCorrect ? this.points : 0,
      maxPoints: this.points,
      feedback: isCorrect ? 'Правильно!' : `Правильный ответ: ${this.correctAnswer}`,
    };
  }

  public getDisplayText(): string {
    return this.text.replace(/\\n/g, '\n');
  }

  public isChoiceType(): boolean {
    return this.type === 'choice' || this.type === 'multiple_choice';
  }

  public requiresTextInput(): boolean {
    return this.type === 'short' || this.type === 'matching';
  }

  public requiresLongAnswer(): boolean {
    return this.type === 'detailed' || this.type === 'proof';
  }

  public clone(): Task {
    return new Task({
      number: this.number,
      text: this.text,
      type: this.type,
      options: this.options ? [...this.options] : undefined,
      correctAnswer: this.correctAnswer,
      points: this.points,
      topic: this.topic,
      detailedSolution: this.requiresDetailedSolution,
      requiresProof: this.requiresProof,
    });
  }

  public toDTO(): TaskDTO {
    return {
      number: this.number,
      text: this.text,
      type: this.type,
      options: this.options ?? undefined,
      correctAnswer: this.correctAnswer,
      points: this.points,
      topic: this.topic,
      detailedSolution: this.requiresDetailedSolution,
      requiresProof: this.requiresProof,
    };
  }

  public static fromDTO(dto: TaskDTO): Task {
    return new Task(dto);
  }
}

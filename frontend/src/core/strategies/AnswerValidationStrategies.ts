import type { IAnswerValidationStrategy } from '../interfaces';

abstract class BaseAnswerValidationStrategy implements IAnswerValidationStrategy {
  public abstract validate(userAnswer: string, correctAnswer: string): boolean;
  public abstract normalize(answer: string): string;

  protected trimWhitespace(str: string): string {
    return str.trim().replace(/\s+/g, ' ');
  }

  protected toLowerCase(str: string): string {
    return str.toLowerCase();
  }
}

export class ShortAnswerStrategy extends BaseAnswerValidationStrategy {
  public validate(userAnswer: string, correctAnswer: string): boolean {
    const normalizedUser = this.normalize(userAnswer);
    const normalizedCorrect = this.normalize(correctAnswer);

    if (normalizedUser === normalizedCorrect) {
      return true;
    }

    const userNumber = this.parseNumber(normalizedUser);
    const correctNumber = this.parseNumber(normalizedCorrect);

    if (userNumber !== null && correctNumber !== null) {
      return Math.abs(userNumber - correctNumber) < 0.0001;
    }

    return false;
  }

  public normalize(answer: string): string {
    return this.trimWhitespace(answer).replace(/,/g, '.').replace(/\s/g, '');
  }

  private parseNumber(str: string): number | null {
    const num = parseFloat(str);
    return isNaN(num) ? null : num;
  }
}

export class ChoiceAnswerStrategy extends BaseAnswerValidationStrategy {
  public validate(userAnswer: string, correctAnswer: string): boolean {
    const normalizedUser = this.normalize(userAnswer);
    const normalizedCorrect = this.normalize(correctAnswer);

    return normalizedUser === normalizedCorrect;
  }

  public normalize(answer: string): string {
    return this.trimWhitespace(answer);
  }
}

export class MultipleChoiceStrategy extends BaseAnswerValidationStrategy {
  public validate(userAnswer: string, correctAnswer: string): boolean {
    const userSet = this.parseChoices(userAnswer);
    const correctSet = this.parseChoices(correctAnswer);

    if (userSet.size !== correctSet.size) {
      return false;
    }

    for (const choice of userSet) {
      if (!correctSet.has(choice)) {
        return false;
      }
    }

    return true;
  }

  public normalize(answer: string): string {
    const choices = this.parseChoices(answer);
    return Array.from(choices).sort().join(', ');
  }

  private parseChoices(answer: string): Set<string> {
    const choices = answer
      .split(/[,;]/)
      .map(s => this.trimWhitespace(s))
      .filter(s => s.length > 0);
    return new Set(choices);
  }
}

export class MatchingAnswerStrategy extends BaseAnswerValidationStrategy {
  public validate(userAnswer: string, correctAnswer: string): boolean {
    const userPairs = this.parsePairs(userAnswer);
    const correctPairs = this.parsePairs(correctAnswer);

    if (userPairs.size !== correctPairs.size) {
      return false;
    }

    for (const [key, value] of userPairs) {
      if (correctPairs.get(key) !== value) {
        return false;
      }
    }

    return true;
  }

  public normalize(answer: string): string {
    const pairs = this.parsePairs(answer);
    return Array.from(pairs.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}-${v}`)
      .join(', ');
  }

  private parsePairs(answer: string): Map<string, string> {
    const pairs = new Map<string, string>();
    const regex = /([А-Яа-яA-Za-z\d]+)\s*[-–—]\s*([А-Яа-яA-Za-z\d]+)/g;
    let match;

    while ((match = regex.exec(answer)) !== null) {
      pairs.set(this.trimWhitespace(match[1]).toUpperCase(), this.trimWhitespace(match[2]));
    }

    return pairs;
  }
}

export class DetailedAnswerStrategy extends BaseAnswerValidationStrategy {
  public validate(_userAnswer: string, _correctAnswer: string): boolean {
    return false;
  }

  public normalize(answer: string): string {
    return this.trimWhitespace(answer);
  }

  public hasAnswer(answer: string): boolean {
    return this.normalize(answer).length > 0;
  }

  public getWordCount(answer: string): number {
    return this.normalize(answer).split(/\s+/).length;
  }
}

export class AnswerValidationStrategyFactory {
  private static strategies: Map<string, IAnswerValidationStrategy> = new Map([
    ['short', new ShortAnswerStrategy()],
    ['choice', new ChoiceAnswerStrategy()],
    ['multiple_choice', new MultipleChoiceStrategy()],
    ['matching', new MatchingAnswerStrategy()],
    ['detailed', new DetailedAnswerStrategy()],
    ['proof', new DetailedAnswerStrategy()],
  ]);

  public static getStrategy(type: string): IAnswerValidationStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      return new ShortAnswerStrategy();
    }
    return strategy;
  }

  public static registerStrategy(type: string, strategy: IAnswerValidationStrategy): void {
    this.strategies.set(type, strategy);
  }
}

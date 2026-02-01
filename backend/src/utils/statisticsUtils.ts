import { SCORING_CONSTANTS } from '../constants/statsConstants';

export class StatisticsCalculator {
  public static calculateAverageScore(scores: ReadonlyArray<number | null>): number {
    const validScores = scores.filter((score): score is number => score !== null);

    if (validScores.length === 0) {
      return 0;
    }

    const sum = validScores.reduce((acc, score) => acc + score, 0);
    return this.roundToDecimal(sum / validScores.length);
  }

  public static calculateBestScore(scores: ReadonlyArray<number | null>): number {
    const validScores = scores.filter((score): score is number => score !== null);

    if (validScores.length === 0) {
      return 0;
    }

    return Math.max(...validScores);
  }

  public static roundToDecimal(value: number, precision: number = SCORING_CONSTANTS.DECIMAL_PRECISION): number {
    return Math.round(value * precision) / precision;
  }

  public static calculateUserPoints(
    totalTests: number,
    averageScore: number,
    bestScore: number,
    achievementsCount: number
  ): number {
    return Math.round(
      totalTests * SCORING_CONSTANTS.TESTS_MULTIPLIER +
      averageScore * SCORING_CONSTANTS.AVERAGE_MULTIPLIER +
      bestScore * SCORING_CONSTANTS.BEST_SCORE_MULTIPLIER +
      achievementsCount * SCORING_CONSTANTS.ACHIEVEMENT_MULTIPLIER
    );
  }

  public static calculatePercentile(
    userScore: number,
    allScores: ReadonlyArray<number>
  ): number {
    if (allScores.length <= 1) {
      return 50;
    }

    const scoresBelow = allScores.filter(score => score < userScore).length;
    return Math.round((scoresBelow / (allScores.length - 1)) * SCORING_CONSTANTS.PERCENTAGE_MULTIPLIER);
  }

  public static calculateWeightedAverage(
    values: ReadonlyArray<number>,
    decayRate: number
  ): number {
    if (values.length === 0) {
      return 0;
    }

    let weightedSum = 0;
    let weightTotal = 0;

    values.forEach((value, index) => {
      const weight = Math.exp(-index * decayRate);
      weightedSum += value * weight;
      weightTotal += weight;
    });

    return weightTotal > 0 ? weightedSum / weightTotal : 0;
  }

  public static calculateVariance(
    values: ReadonlyArray<number>,
    mean: number
  ): number {
    if (values.length === 0) {
      return 0;
    }

    const sumSquaredDiff = values.reduce((sum, value) => {
      return sum + Math.pow(value - mean, 2);
    }, 0);

    return sumSquaredDiff / values.length;
  }

  public static calculateStandardDeviation(
    values: ReadonlyArray<number>,
    mean: number
  ): number {
    return Math.sqrt(this.calculateVariance(values, mean));
  }

  public static clampValue(
    value: number,
    min: number,
    max: number
  ): number {
    return Math.max(min, Math.min(max, value));
  }
}

export class DateCalculator {
  public static getDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  public static getDaysDifference(date1: Date, date2: Date): number {
    const diffTime = date1.getTime() - date2.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  public static getDateDaysAgo(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  public static getTodayMidnight(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  public static getDatesInRange(startDaysAgo: number): Map<string, boolean> {
    const dates = new Map<string, boolean>();
    const now = new Date();

    for (let i = 0; i < startDaysAgo; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dates.set(this.getDateKey(date), true);
    }

    return dates;
  }
}

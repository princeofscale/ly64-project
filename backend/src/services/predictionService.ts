import { PREDICTION_CONSTANTS } from '../constants/statsConstants';
import { StatisticsCalculator } from '../utils/statisticsUtils';

import type { PredictionData, DailyActivity } from '../types/userTypes';

interface TestAttempt {
  readonly score: number | null;
}

export class PredictionService {
  public calculatePrediction(
    testAttempts: ReadonlyArray<TestAttempt>,
    totalTests: number,
    averageScore: number,
    dailyActivity: ReadonlyArray<DailyActivity>,
    currentStreak: number
  ): PredictionData {
    if (totalTests < PREDICTION_CONSTANTS.MIN_TESTS_FOR_PREDICTION) {
      return this.createDefaultPrediction(averageScore);
    }

    const recentScores = this.extractRecentScores(testAttempts, totalTests);
    const weightedAvg = this.calculateWeightedMovingAverage(recentScores);
    const momentum = this.calculateMomentum(recentScores);
    const consistency = this.calculateConsistency(recentScores, averageScore);
    const frequencyFactor = this.calculateFrequencyFactor(dailyActivity);
    const recentBoost = this.calculateRecentBoost(recentScores, averageScore);

    const predictedScore = this.computePredictedScore(
      weightedAvg,
      momentum,
      recentBoost,
      frequencyFactor,
      consistency,
      averageScore
    );

    const confidence = this.calculateConfidence(totalTests, consistency, frequencyFactor);

    const factors = this.buildPredictionFactors(
      momentum,
      frequencyFactor,
      consistency,
      currentStreak
    );

    return {
      predictedScore: StatisticsCalculator.roundToDecimal(predictedScore),
      confidence,
      factors,
    };
  }

  private createDefaultPrediction(averageScore: number): PredictionData {
    return {
      predictedScore: averageScore,
      confidence: 0,
      factors: [],
    };
  }

  private extractRecentScores(
    attempts: ReadonlyArray<TestAttempt>,
    totalTests: number
  ): ReadonlyArray<number> {
    const limit = Math.min(PREDICTION_CONSTANTS.RECENT_SCORES_LIMIT, totalTests);
    return attempts.slice(0, limit).map(attempt => attempt.score ?? 0);
  }

  private calculateWeightedMovingAverage(scores: ReadonlyArray<number>): number {
    return StatisticsCalculator.calculateWeightedAverage(
      scores,
      PREDICTION_CONSTANTS.EXPONENTIAL_DECAY
    );
  }

  private calculateMomentum(scores: ReadonlyArray<number>): number {
    const firstScores = scores.slice(0, PREDICTION_CONSTANTS.FIRST_SCORES_COUNT);
    const lastScores = scores.slice(-PREDICTION_CONSTANTS.LAST_SCORES_COUNT);

    const first5Avg = StatisticsCalculator.calculateAverageScore(firstScores);
    const last5Avg = StatisticsCalculator.calculateAverageScore(lastScores);

    return first5Avg - last5Avg;
  }

  private calculateConsistency(scores: ReadonlyArray<number>, averageScore: number): number {
    const stdDev = StatisticsCalculator.calculateStandardDeviation(scores, averageScore);
    return Math.max(
      0,
      PREDICTION_CONSTANTS.CONSISTENCY_MAX_SCORE -
        stdDev * PREDICTION_CONSTANTS.CONSISTENCY_VARIANCE_MULTIPLIER
    );
  }

  private calculateFrequencyFactor(dailyActivity: ReadonlyArray<DailyActivity>): number {
    const daysWithActivity = dailyActivity.filter(day => day.count > 0).length;
    return Math.min(1, daysWithActivity / PREDICTION_CONSTANTS.FREQUENCY_DAYS_DIVISOR);
  }

  private calculateRecentBoost(scores: ReadonlyArray<number>, averageScore: number): number {
    const recentScores = scores.slice(0, PREDICTION_CONSTANTS.MIN_RECENT_SCORES);
    const recentAvg = StatisticsCalculator.calculateAverageScore(recentScores);
    return (recentAvg - averageScore) * PREDICTION_CONSTANTS.RECENT_BOOST_WEIGHT;
  }

  private computePredictedScore(
    weightedAvg: number,
    momentum: number,
    recentBoost: number,
    frequencyFactor: number,
    consistency: number,
    averageScore: number
  ): number {
    let predicted = weightedAvg + momentum * PREDICTION_CONSTANTS.MOMENTUM_WEIGHT + recentBoost;

    predicted += frequencyFactor * PREDICTION_CONSTANTS.FREQUENCY_BONUS;

    if (consistency > PREDICTION_CONSTANTS.CONSISTENCY_THRESHOLD) {
      predicted += PREDICTION_CONSTANTS.CONSISTENCY_BONUS;
    }

    const minScore = averageScore - PREDICTION_CONSTANTS.MAX_SCORE_DIFF;
    return StatisticsCalculator.clampValue(predicted, minScore, PREDICTION_CONSTANTS.MAX_SCORE);
  }

  private calculateConfidence(
    totalTests: number,
    consistency: number,
    frequencyFactor: number
  ): number {
    let confidence = PREDICTION_CONSTANTS.BASE_CONFIDENCE;

    if (totalTests >= PREDICTION_CONSTANTS.CONFIDENCE_TEST_THRESHOLD) {
      confidence += 20;
    } else {
      confidence += totalTests * PREDICTION_CONSTANTS.CONFIDENCE_PER_TEST;
    }

    if (consistency > PREDICTION_CONSTANTS.CONFIDENCE_CONSISTENCY_THRESHOLD) {
      confidence += PREDICTION_CONSTANTS.CONFIDENCE_CONSISTENCY_BONUS;
    }

    confidence += frequencyFactor * PREDICTION_CONSTANTS.CONFIDENCE_FREQUENCY_MULTIPLIER;

    return Math.min(PREDICTION_CONSTANTS.CONFIDENCE_MAX, confidence);
  }

  private buildPredictionFactors(
    momentum: number,
    frequencyFactor: number,
    consistency: number,
    currentStreak: number
  ): ReadonlyArray<string> {
    const factors: string[] = [];

    if (consistency > PREDICTION_CONSTANTS.CONSISTENCY_THRESHOLD) {
      factors.push('Стабильные результаты');
    }

    if (momentum > PREDICTION_CONSTANTS.MOMENTUM_POSITIVE_THRESHOLD) {
      factors.push('Положительная динамика');
    }

    if (momentum < PREDICTION_CONSTANTS.MOMENTUM_NEGATIVE_THRESHOLD) {
      factors.push('Требуется больше практики');
    }

    if (frequencyFactor > PREDICTION_CONSTANTS.FREQUENCY_THRESHOLD) {
      factors.push('Регулярные занятия');
    }

    if (currentStreak >= PREDICTION_CONSTANTS.STREAK_THRESHOLD) {
      factors.push(`Серия ${currentStreak} дней`);
    }

    return factors;
  }
}

export default new PredictionService();

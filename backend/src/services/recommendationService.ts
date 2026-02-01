import prisma  from '../config/database';

interface TopicAnalysis {
  topic: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  lastAttempt: Date | null;
  trend: 'improving' | 'stable' | 'declining';
}

interface WeaknessArea {
  topic: string;
  subject: string;
  accuracy: number;
  questionsAnalyzed: number;
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
}

interface Recommendation {
  type: 'practice' | 'review' | 'test' | 'theory';
  title: string;
  description: string;
  topic: string;
  subject: string;
  priority: number;
  estimatedTime: number;
  reason: string;
}

interface UserAnalysis {
  overallAccuracy: number;
  strongTopics: TopicAnalysis[];
  weakTopics: TopicAnalysis[];
  recommendations: Recommendation[];
  nextSteps: string[];
}


const topicDifficulty: Record<string, number> = {
  'arithmetic': 1,
  'fractions': 1,
  'percent': 2,
  'equations_linear': 2,
  'equations_quadratic': 3,
  'inequalities': 3,
  'functions': 3,
  'geometry_basic': 2,
  'geometry_advanced': 4,
  'trigonometry': 4,
  'probability': 3,
  'statistics': 2,
  'sequences': 3,
  'logarithms': 4,
  'derivatives': 5,
  'integrals': 5,
};

class RecommendationService {
  private static instance: RecommendationService;

  private constructor() {}

  public static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService();
    }
    return RecommendationService.instance;
  }

  async analyzeUser(userId: string): Promise<UserAnalysis> {
    const attempts = await this.getUserAttempts(userId);
    const topicAnalysis = await this.analyzeTopics(attempts);

    const strongTopics = topicAnalysis
      .filter(t => t.accuracy >= 70)
      .sort((a, b) => b.accuracy - a.accuracy);

    const weakTopics = topicAnalysis
      .filter(t => t.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy);

    const overallAccuracy = topicAnalysis.length > 0
      ? Math.round(topicAnalysis.reduce((sum, t) => sum + t.accuracy, 0) / topicAnalysis.length)
      : 0;

    const recommendations = this.generateRecommendations(weakTopics, strongTopics);
    const nextSteps = this.generateNextSteps(weakTopics, overallAccuracy);

    return {
      overallAccuracy,
      strongTopics: strongTopics.slice(0, 5),
      weakTopics: weakTopics.slice(0, 5),
      recommendations: recommendations.slice(0, 10),
      nextSteps,
    };
  }

  async getWeaknesses(userId: string): Promise<WeaknessArea[]> {
    const attempts = await this.getUserAttempts(userId);
    const topicAnalysis = await this.analyzeTopics(attempts);

    return topicAnalysis
      .filter(t => t.accuracy < 70 && t.totalQuestions >= 3)
      .map(t => ({
        topic: t.topic,
        subject: 'MATHEMATICS',
        accuracy: t.accuracy,
        questionsAnalyzed: t.totalQuestions,
        priority: (t.accuracy < 40 ? 'high' : t.accuracy < 60 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
        recommendation: this.getTopicRecommendation(t),
      }))
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }

  async getRecommendations(userId: string, limit: number = 5): Promise<Recommendation[]> {
    const analysis = await this.analyzeUser(userId);
    return analysis.recommendations.slice(0, limit);
  }

  async getRecommendedTests(userId: string): Promise<{
    tests: { id: string; title: string; reason: string; priority: number }[];
  }> {
    const weaknesses = await this.getWeaknesses(userId);

    const tests = await prisma.test.findMany({
      where: {
        isDiagnostic: false,
      },
      include: {
        questions: {
          include: {
            question: true,
          },
        },
      },
    });

    const recommendedTests = tests
      .map(test => {
        const weakTopicsCount = test.questions.filter(tq =>
          weaknesses.some(w => tq.question.topic?.toLowerCase().includes(w.topic.toLowerCase()))
        ).length;

        const priority = weakTopicsCount > 0 ? weakTopicsCount / test.questions.length : 0;

        return {
          id: test.id,
          title: test.title,
          reason: weakTopicsCount > 0
            ? `Содержит ${weakTopicsCount} вопросов по вашим слабым темам`
            : 'Общая практика',
          priority,
        };
      })
      .filter(t => t.priority > 0)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5);

    return { tests: recommendedTests };
  }

  async getTopicProgress(userId: string): Promise<TopicAnalysis[]> {
    const attempts = await this.getUserAttempts(userId);
    return this.analyzeTopics(attempts);
  }

  private async getUserAttempts(userId: string) {
    return prisma.testAttempt.findMany({
      where: {
        userId,
        completedAt: { not: null },
      },
      include: {
        test: {
          include: {
            questions: {
              include: {
                question: true,
              },
            },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: 50,
    });
  }

  private async analyzeTopics(attempts: any[]): Promise<TopicAnalysis[]> {
    const topicStats = new Map<string, {
      total: number;
      correct: number;
      dates: Date[];
    }>();

    for (const attempt of attempts) {
      if (!attempt.answers) continue;

      let answers: any[];
      try {
        answers = JSON.parse(attempt.answers);
      } catch {
        continue;
      }

      const questionsMap = new Map<string, any>(
        attempt.test.questions.map((tq: any) => [tq.question.id, tq.question])
      );

      for (const answer of answers) {
        const question = questionsMap.get(answer.questionId);
        if (!question) continue;

        const topic = (question as any).topic || 'general';
        const stats = topicStats.get(topic) || { total: 0, correct: 0, dates: [] };

        stats.total++;
        if (answer.isCorrect) stats.correct++;
        if (attempt.completedAt) stats.dates.push(attempt.completedAt);

        topicStats.set(topic, stats);
      }
    }

    const results: TopicAnalysis[] = [];

    for (const [topic, stats] of topicStats.entries()) {
      const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      const lastAttempt = stats.dates.length > 0
        ? new Date(Math.max(...stats.dates.map(d => d.getTime())))
        : null;

      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (stats.dates.length >= 4) {
        trend = 'stable';
      }

      results.push({
        topic,
        totalQuestions: stats.total,
        correctAnswers: stats.correct,
        accuracy,
        lastAttempt,
        trend,
      });
    }

    return results.sort((a, b) => b.totalQuestions - a.totalQuestions);
  }

  private generateRecommendations(
    weakTopics: TopicAnalysis[],
    strongTopics: TopicAnalysis[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    for (const topic of weakTopics.slice(0, 5)) {
      const priority = topic.accuracy < 40 ? 10 : topic.accuracy < 60 ? 7 : 5;

      recommendations.push({
        type: 'theory',
        title: `Повторите теорию: ${this.formatTopicName(topic.topic)}`,
        description: `Ваша точность ${topic.accuracy}%. Рекомендуем начать с изучения теории.`,
        topic: topic.topic,
        subject: 'MATHEMATICS',
        priority,
        estimatedTime: 15,
        reason: `Низкая точность (${topic.accuracy}%)`,
      });

      recommendations.push({
        type: 'practice',
        title: `Практика: ${this.formatTopicName(topic.topic)}`,
        description: `Решите 10-15 задач по теме для закрепления.`,
        topic: topic.topic,
        subject: 'MATHEMATICS',
        priority: priority - 1,
        estimatedTime: 20,
        reason: `Необходима практика по слабой теме`,
      });
    }

    for (const topic of strongTopics.slice(0, 2)) {
      if (!topic.lastAttempt) continue;

      const daysSinceLastPractice = Math.floor(
        (Date.now() - topic.lastAttempt.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastPractice > 7) {
        recommendations.push({
          type: 'review',
          title: `Освежите знания: ${this.formatTopicName(topic.topic)}`,
          description: `Прошло ${daysSinceLastPractice} дней с последней практики.`,
          topic: topic.topic,
          subject: 'MATHEMATICS',
          priority: 3,
          estimatedTime: 10,
          reason: 'Давно не практиковались',
        });
      }
    }

    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  private generateNextSteps(weakTopics: TopicAnalysis[], overallAccuracy: number): string[] {
    const steps: string[] = [];

    if (overallAccuracy < 50) {
      steps.push('Сосредоточьтесь на базовых темах перед переходом к сложным');
      steps.push('Решайте задачи с разбором решений');
    } else if (overallAccuracy < 70) {
      steps.push('Работайте над слабыми темами по 20-30 минут в день');
      steps.push('Пройдите полный пробный тест для оценки прогресса');
    } else {
      steps.push('Поддерживайте форму регулярной практикой');
      steps.push('Попробуйте задачи повышенной сложности');
    }

    if (weakTopics.length > 0) {
      const topWeakTopic = weakTopics[0];
      steps.push(`Приоритет: улучшите "${this.formatTopicName(topWeakTopic.topic)}" (${topWeakTopic.accuracy}%)`);
    }

    return steps;
  }

  private getTopicRecommendation(topic: TopicAnalysis): string {
    if (topic.accuracy < 30) {
      return 'Начните с изучения теории с нуля. Решайте простые примеры.';
    }
    if (topic.accuracy < 50) {
      return 'Повторите ключевые формулы. Решайте задачи с подсказками.';
    }
    if (topic.accuracy < 70) {
      return 'Практикуйтесь на задачах среднего уровня. Анализируйте ошибки.';
    }
    return 'Попробуйте сложные задачи для закрепления.';
  }

  private formatTopicName(topic: string): string {
    const names: Record<string, string> = {
      'arithmetic': 'Арифметика',
      'fractions': 'Дроби',
      'percent': 'Проценты',
      'equations_linear': 'Линейные уравнения',
      'equations_quadratic': 'Квадратные уравнения',
      'inequalities': 'Неравенства',
      'functions': 'Функции',
      'geometry_basic': 'Базовая геометрия',
      'geometry_advanced': 'Продвинутая геометрия',
      'trigonometry': 'Тригонометрия',
      'probability': 'Вероятность',
      'statistics': 'Статистика',
      'sequences': 'Последовательности',
      'logarithms': 'Логарифмы',
      'derivatives': 'Производные',
      'integrals': 'Интегралы',
      'general': 'Общее',
    };
    return names[topic] || topic;
  }
}

export const recommendationService = RecommendationService.getInstance();
export default recommendationService;

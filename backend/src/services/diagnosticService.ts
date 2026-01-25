import prisma from '../config/database';
import achievementService from './achievementService';

const REQUIRED_SUBJECTS = ['RUSSIAN', 'MATHEMATICS'];

const DIRECTION_SUBJECTS: Record<string, string[]> = {
  PROGRAMMING: ['PHYSICS', 'INFORMATICS'],
  ROBOTICS: ['PHYSICS', 'INFORMATICS'],
  MEDICINE: ['BIOLOGY'],
  BIOTECHNOLOGY: ['BIOLOGY'],
  CULTURE: ['HISTORY', 'ENGLISH'],
};

const LEVEL_THRESHOLDS = {
  BEGINNER: 40,
  INTERMEDIATE: 70,
  ADVANCED: 100,
};

const TOPICS_BY_SUBJECT: Record<string, { topic: string; hours: number }[]> = {
  RUSSIAN: [
    { topic: 'Орфография', hours: 8 },
    { topic: 'Пунктуация', hours: 8 },
    { topic: 'Грамматика', hours: 6 },
    { topic: 'Лексика и фразеология', hours: 4 },
    { topic: 'Речь и текст', hours: 6 },
    { topic: 'Сочинение', hours: 10 },
  ],
  MATHEMATICS: [
    { topic: 'Алгебра: уравнения', hours: 8 },
    { topic: 'Алгебра: неравенства', hours: 6 },
    { topic: 'Функции и графики', hours: 8 },
    { topic: 'Геометрия: планиметрия', hours: 10 },
    { topic: 'Текстовые задачи', hours: 6 },
    { topic: 'Теория вероятностей', hours: 4 },
  ],
  PHYSICS: [
    { topic: 'Механика', hours: 10 },
    { topic: 'Термодинамика', hours: 6 },
    { topic: 'Электричество', hours: 8 },
    { topic: 'Оптика', hours: 4 },
    { topic: 'Задачи на формулы', hours: 8 },
  ],
  INFORMATICS: [
    { topic: 'Системы счисления', hours: 4 },
    { topic: 'Логика', hours: 6 },
    { topic: 'Алгоритмы', hours: 8 },
    { topic: 'Программирование', hours: 12 },
    { topic: 'Работа с данными', hours: 6 },
  ],
  BIOLOGY: [
    { topic: 'Клетка и организм', hours: 8 },
    { topic: 'Генетика', hours: 8 },
    { topic: 'Эволюция', hours: 6 },
    { topic: 'Экология', hours: 4 },
    { topic: 'Анатомия человека', hours: 10 },
  ],
  HISTORY: [
    { topic: 'Древняя Русь', hours: 6 },
    { topic: 'Россия XVI-XVIII вв', hours: 8 },
    { topic: 'XIX век', hours: 8 },
    { topic: 'XX век', hours: 10 },
    { topic: 'Работа с источниками', hours: 4 },
  ],
  ENGLISH: [
    { topic: 'Грамматика', hours: 10 },
    { topic: 'Лексика', hours: 8 },
    { topic: 'Чтение', hours: 6 },
    { topic: 'Аудирование', hours: 6 },
    { topic: 'Письмо', hours: 8 },
  ],
};

export class DiagnosticService {
  getSubjectsForUser(direction?: string): string[] {
    const subjects = [...REQUIRED_SUBJECTS];
    if (direction && DIRECTION_SUBJECTS[direction]) {
      subjects.push(...DIRECTION_SUBJECTS[direction]);
    }
    return [...new Set(subjects)];
  }

  calculateLevel(score: number): string {
    if (score < LEVEL_THRESHOLDS.BEGINNER) return 'BEGINNER';
    if (score < LEVEL_THRESHOLDS.INTERMEDIATE) return 'INTERMEDIATE';
    return 'ADVANCED';
  }

  async saveDiagnosticResult(
    userId: string,
    subject: string,
    score: number,
    details?: object
  ) {
    const level = this.calculateLevel(score);

    const result = await prisma.diagnosticResult.upsert({
      where: { userId_subject: { userId, subject } },
      update: { score, level, details: details ? JSON.stringify(details) : null },
      create: {
        userId,
        subject,
        score,
        level,
        details: details ? JSON.stringify(details) : null,
      },
    });

    achievementService
      .checkAndUnlockAchievements(userId)
      .catch((err) => console.error('Error unlocking achievements:', err));

    return result;
  }

  async getUserDiagnosticResults(userId: string) {
    return prisma.diagnosticResult.findMany({
      where: { userId },
    });
  }

  async generateLearningPlan(userId: string, direction?: string) {
    const diagnosticResults = await this.getUserDiagnosticResults(userId);
    const subjects = this.getSubjectsForUser(direction);

    const items: {
      subject: string;
      topic: string;
      priority: number;
      estimatedHours: number;
      order: number;
    }[] = [];

    let order = 0;
    let totalHours = 0;

    for (const subject of subjects) {
      const result = diagnosticResults.find((r) => r.subject === subject);
      const level = result?.level || 'BEGINNER';
      const topics = TOPICS_BY_SUBJECT[subject] || [];

      let hoursMultiplier = 1;
      if (level === 'BEGINNER') hoursMultiplier = 1.5;
      else if (level === 'ADVANCED') hoursMultiplier = 0.5;

      const isRequired = REQUIRED_SUBJECTS.includes(subject);
      const basePriority = isRequired ? 100 : 50;

      for (const { topic, hours } of topics) {
        const adjustedHours = Math.ceil(hours * hoursMultiplier);
        const priority = basePriority + (level === 'BEGINNER' ? 20 : 0);

        items.push({
          subject,
          topic,
          priority,
          estimatedHours: adjustedHours,
          order: order++,
        });

        totalHours += adjustedHours;
      }
    }

    items.sort((a, b) => b.priority - a.priority || a.order - b.order);
    items.forEach((item, idx) => (item.order = idx));

    const existingPlan = await prisma.learningPlan.findUnique({
      where: { userId },
    });

    if (existingPlan) {
      await prisma.learningPlanItem.deleteMany({
        where: { planId: existingPlan.id },
      });

      await prisma.learningPlan.update({
        where: { userId },
        data: {
          direction,
          totalHours,
          completedHours: 0,
          items: { create: items },
        },
      });

      return prisma.learningPlan.findUnique({
        where: { userId },
        include: { items: { orderBy: { order: 'asc' } } },
      });
    }

    return prisma.learningPlan.create({
      data: {
        userId,
        direction,
        totalHours,
        items: { create: items },
      },
      include: { items: { orderBy: { order: 'asc' } } },
    });
  }

  async getLearningPlan(userId: string) {
    return prisma.learningPlan.findUnique({
      where: { userId },
      include: { items: { orderBy: { order: 'asc' } } },
    });
  }

  async markTopicCompleted(userId: string, itemId: string) {
    const item = await prisma.learningPlanItem.findUnique({
      where: { id: itemId },
      include: { plan: true },
    });

    if (!item || item.plan.userId !== userId) {
      throw new Error('Item not found');
    }

    await prisma.learningPlanItem.update({
      where: { id: itemId },
      data: { completed: true },
    });

    if (!item.completed) {
      await prisma.learningPlan.update({
        where: { userId },
        data: { completedHours: { increment: item.estimatedHours } },
      });
    }

    return this.getLearningPlan(userId);
  }

  async checkDiagnosticCompleted(userId: string, direction?: string): Promise<boolean> {
    const subjects = this.getSubjectsForUser(direction);
    const results = await this.getUserDiagnosticResults(userId);
    const completedSubjects = results.map((r) => r.subject);

    return subjects.every((s) => completedSubjects.includes(s));
  }
}

export default new DiagnosticService();

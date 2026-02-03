'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.DiagnosticService = void 0;
const database_1 = require('../config/database');
const achievementService_1 = __importDefault(require('./achievementService'));
const REQUIRED_SUBJECTS = ['RUSSIAN', 'MATHEMATICS'];
const DIRECTION_SUBJECTS = {
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
const TOPICS_BY_SUBJECT = {
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
class DiagnosticService {
  getSubjectsForUser(direction) {
    const subjects = [...REQUIRED_SUBJECTS];
    if (direction && DIRECTION_SUBJECTS[direction]) {
      subjects.push(...DIRECTION_SUBJECTS[direction]);
    }
    return [...new Set(subjects)];
  }
  calculateLevel(score) {
    if (score < LEVEL_THRESHOLDS.BEGINNER) return 'BEGINNER';
    if (score < LEVEL_THRESHOLDS.INTERMEDIATE) return 'INTERMEDIATE';
    return 'ADVANCED';
  }
  async saveDiagnosticResult(userId, subject, score, details) {
    const level = this.calculateLevel(score);
    const result = await database_1.prisma.diagnosticResult.upsert({
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
    achievementService_1.default
      .checkAndUnlockAchievements(userId)
      .catch(err => console.error('Error unlocking achievements:', err));
    return result;
  }
  async getUserDiagnosticResults(userId) {
    return database_1.prisma.diagnosticResult.findMany({
      where: { userId },
    });
  }
  async generateLearningPlan(userId, direction) {
    const diagnosticResults = await this.getUserDiagnosticResults(userId);
    const subjects = this.getSubjectsForUser(direction);
    const items = [];
    let order = 0;
    let totalHours = 0;
    for (const subject of subjects) {
      const result = diagnosticResults.find(r => r.subject === subject);
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
    const existingPlan = await database_1.prisma.learningPlan.findUnique({
      where: { userId },
    });
    if (existingPlan) {
      await database_1.prisma.learningPlanItem.deleteMany({
        where: { planId: existingPlan.id },
      });
      await database_1.prisma.learningPlan.update({
        where: { userId },
        data: {
          direction,
          totalHours,
          completedHours: 0,
          items: { create: items },
        },
      });
      return database_1.prisma.learningPlan.findUnique({
        where: { userId },
        include: { items: { orderBy: { order: 'asc' } } },
      });
    }
    return database_1.prisma.learningPlan.create({
      data: {
        userId,
        direction,
        totalHours,
        items: { create: items },
      },
      include: { items: { orderBy: { order: 'asc' } } },
    });
  }
  async getLearningPlan(userId) {
    return database_1.prisma.learningPlan.findUnique({
      where: { userId },
      include: { items: { orderBy: { order: 'asc' } } },
    });
  }
  async markTopicCompleted(userId, itemId) {
    const item = await database_1.prisma.learningPlanItem.findUnique({
      where: { id: itemId },
      include: { plan: true },
    });
    if (!item || item.plan.userId !== userId) {
      throw new Error('Item not found');
    }
    await database_1.prisma.learningPlanItem.update({
      where: { id: itemId },
      data: { completed: true },
    });
    if (!item.completed) {
      await database_1.prisma.learningPlan.update({
        where: { userId },
        data: { completedHours: { increment: item.estimatedHours } },
      });
    }
    return this.getLearningPlan(userId);
  }
  async checkDiagnosticCompleted(userId, direction) {
    const subjects = this.getSubjectsForUser(direction);
    const results = await this.getUserDiagnosticResults(userId);
    const completedSubjects = results.map(r => r.subject);
    return subjects.every(s => completedSubjects.includes(s));
  }
}
exports.DiagnosticService = DiagnosticService;
exports.default = new DiagnosticService();
//# sourceMappingURL=diagnosticService.js.map

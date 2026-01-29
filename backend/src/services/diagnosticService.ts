import { prisma } from '../config/database';
import achievementService from './achievementService';

const REQUIRED_SUBJECTS = ['RUSSIAN', 'MATHEMATICS'];

const DIRECTION_SUBJECTS: Record<string, string[]> = {
  PROGRAMMING: ['PHYSICS', 'INFORMATICS'],
  ROBOTICS: ['PHYSICS', 'INFORMATICS'],
  MEDICINE: ['CHEMISTRY', 'BIOLOGY'],
  BIOTECHNOLOGY: ['CHEMISTRY', 'BIOLOGY'],
  CULTURE: ['HISTORY'],
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
  CHEMISTRY: [
    { topic: 'Строение атома', hours: 6 },
    { topic: 'Химическая связь', hours: 6 },
    { topic: 'Неорганическая химия', hours: 10 },
    { topic: 'Органическая химия', hours: 12 },
    { topic: 'Химические реакции', hours: 8 },
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

// Рекомендации по темам
const TOPIC_RECOMMENDATIONS: Record<string, Record<string, string>> = {
  RUSSIAN: {
    'Орфография': 'Повтори правила правописания корней с чередованием, приставок ПРЕ-/ПРИ-, Н и НН в разных частях речи. Практикуй диктанты.',
    'Пунктуация': 'Обрати внимание на знаки препинания при обособленных членах, в сложных предложениях. Разбирай предложения по составу.',
    'Грамматика': 'Повтори части речи и их морфологические признаки. Делай морфологический разбор слов.',
    'Лексика': 'Расширяй словарный запас, изучай синонимы, антонимы, фразеологизмы. Читай художественную литературу.',
    'Речь и текст': 'Практикуй написание сочинений, анализируй тексты разных стилей. Учись выделять главную мысль.',
  },
  MATHEMATICS: {
    'Уравнения': 'Повтори методы решения линейных и квадратных уравнений. Практикуй решение систем уравнений.',
    'Неравенства': 'Изучи метод интервалов, повтори свойства неравенств. Решай задачи с модулем.',
    'Алгебра': 'Повтори формулы сокращённого умножения, работу с дробями и степенями.',
    'Геометрия': 'Выучи основные теоремы планиметрии, признаки равенства и подобия треугольников.',
    'Вероятность': 'Изучи основные формулы комбинаторики и теории вероятностей.',
    'Тригонометрия': 'Выучи значения тригонометрических функций, основные тождества.',
  },
  PHYSICS: {
    'Механика': 'Повтори законы Ньютона, формулы кинематики. Решай задачи на движение тел.',
    'Электричество': 'Изучи закон Ома, правила Кирхгофа. Практикуй расчёт электрических цепей.',
    'Оптика': 'Повтори законы отражения и преломления, формулу тонкой линзы.',
    'Термодинамика': 'Изучи газовые законы, первое начало термодинамики.',
    'Колебания': 'Повтори формулы гармонических колебаний, понятия периода и частоты.',
  },
  INFORMATICS: {
    'Системы счисления': 'Практикуй перевод чисел между системами счисления. Выучи алгоритмы перевода.',
    'Логика': 'Повтори таблицы истинности, законы алгебры логики. Решай логические выражения.',
    'Алгоритмы': 'Изучи основные алгоритмы сортировки и поиска. Оценивай сложность алгоритмов.',
    'Программирование': 'Практикуй написание кода, изучи основные структуры данных.',
    'Информация': 'Повтори единицы измерения информации, формулы Хартли и Шеннона.',
  },
  BIOLOGY: {
    'Клетка': 'Изучи строение клетки, функции органоидов. Сравни растительную и животную клетки.',
    'Генетика': 'Повтори законы Менделя, решай генетические задачи. Изучи типы наследования.',
    'Фотосинтез': 'Разбери фазы фотосинтеза, изучи роль хлорофилла.',
    'Анатомия': 'Повтори системы органов человека, их функции и взаимосвязь.',
    'Экология': 'Изучи экологические факторы, пищевые цепи, круговорот веществ.',
  },
  CHEMISTRY: {
    'Строение атома': 'Повтори строение электронных оболочек, периодический закон.',
    'Химическая связь': 'Изучи типы химических связей, их характеристики.',
    'Химические реакции': 'Практикуй уравнивание реакций, изучи типы реакций.',
    'Органическая химия': 'Повтори классы органических соединений, их свойства.',
    'Основы': 'Выучи химические символы, валентность элементов, номенклатуру.',
  },
  HISTORY: {
    'Древняя Русь': 'Изучи основные события IX-XII веков, первых русских князей.',
    'XVI-XVIII вв': 'Повтори эпоху Ивана Грозного, Смутное время, реформы Петра I.',
    'XIX век': 'Изучи реформы Александра II, общественные движения.',
    'XX век': 'Повтори революции, Великую Отечественную войну, распад СССР.',
  },
};

// Общие рекомендации по уровню
const LEVEL_RECOMMENDATIONS: Record<string, string> = {
  BEGINNER: 'Начни с базовых понятий и определений. Используй учебники и видеоуроки для изучения основ.',
  INTERMEDIATE: 'У тебя хорошая база! Фокусируйся на сложных темах и практикуй решение задач.',
  ADVANCED: 'Отличный уровень! Углубляй знания, решай олимпиадные задачи.',
};

export class DiagnosticService {
  getSubjectsForUser(direction?: string, grade?: number): string[] {
    const subjects = [...REQUIRED_SUBJECTS];

    // Добавляем предметы по направлению для всех классов
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

    // Проверяем и обновляем флаг завершения диагностики
    this.markDiagnosticCompleted(userId)
      .catch((err) => console.error('Error marking diagnostic completed:', err));

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

  async generateLearningPlan(userId: string, direction?: string, grade?: number) {
    const diagnosticResults = await this.getUserDiagnosticResults(userId);
    const subjects = this.getSubjectsForUser(direction, grade);

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

  async checkDiagnosticCompleted(userId: string, direction?: string, grade?: number): Promise<boolean> {
    const subjects = this.getSubjectsForUser(direction, grade);
    const results = await this.getUserDiagnosticResults(userId);
    const completedSubjects = results.map((r) => r.subject);

    return subjects.every((s) => completedSubjects.includes(s));
  }

  async generateRecommendations(userId: string) {
    const results = await this.getUserDiagnosticResults(userId);
    const recommendations: {
      subject: string;
      level: string;
      score: number;
      generalAdvice: string;
      weakTopics: { topic: string; advice: string }[];
      priority: 'high' | 'medium' | 'low';
    }[] = [];

    for (const result of results) {
      const details = result.details ? JSON.parse(result.details as string) : null;
      const weakTopics: { topic: string; advice: string }[] = [];

      // Анализируем ошибки по темам из details
      if (details?.wrongAnswers && Array.isArray(details.wrongAnswers)) {
        const topicErrors: Record<string, number> = {};

        for (const wrong of details.wrongAnswers) {
          if (wrong.topic) {
            topicErrors[wrong.topic] = (topicErrors[wrong.topic] || 0) + 1;
          }
        }

        // Сортируем темы по количеству ошибок
        const sortedTopics = Object.entries(topicErrors)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3); // Топ-3 проблемных темы

        for (const [topic] of sortedTopics) {
          const advice = TOPIC_RECOMMENDATIONS[result.subject]?.[topic] ||
            `Повтори тему "${topic}" - здесь были допущены ошибки.`;
          weakTopics.push({ topic, advice });
        }
      }

      // Если нет детальной информации, даём общие рекомендации по уровню
      if (weakTopics.length === 0 && result.level !== 'ADVANCED') {
        const subjectTopics = TOPIC_RECOMMENDATIONS[result.subject];
        if (subjectTopics) {
          const topicEntries = Object.entries(subjectTopics).slice(0, 2);
          for (const [topic, advice] of topicEntries) {
            weakTopics.push({ topic, advice });
          }
        }
      }

      // Определяем приоритет
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (result.level === 'BEGINNER') priority = 'high';
      else if (result.level === 'INTERMEDIATE') priority = 'medium';

      recommendations.push({
        subject: result.subject,
        level: result.level,
        score: result.score,
        generalAdvice: LEVEL_RECOMMENDATIONS[result.level] || '',
        weakTopics,
        priority,
      });
    }

    // Сортируем по приоритету
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return recommendations;
  }

  async markDiagnosticCompleted(userId: string): Promise<void> {
    // Получаем данные пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        desiredDirection: true,
        currentGrade: true,
        diagnosticCompleted: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Если уже завершена, ничего не делаем
    if (user.diagnosticCompleted) {
      return;
    }

    // Проверяем завершение всех необходимых тестов
    const isCompleted = await this.checkDiagnosticCompleted(
      userId,
      user.desiredDirection || undefined,
      user.currentGrade
    );

    // Если все тесты пройдены, обновляем флаг
    if (isCompleted) {
      await prisma.user.update({
        where: { id: userId },
        data: { diagnosticCompleted: true },
      });
      console.log(`✅ User ${userId} completed diagnostic`);
    }
  }
}

export default new DiagnosticService();

import prisma from '../config/database';

// Названия типов вопросов
const QUESTION_TYPE_LABELS: Record<string, string> = {
  SINGLE_CHOICE: 'Выбор одного ответа',
  MULTIPLE_CHOICE: 'Множественный выбор',
  TEXT_INPUT: 'Краткий ответ',
  DETAILED_ANSWER: 'Развёрнутый ответ',
  short: 'Краткий ответ',
  choice: 'Выбор ответа',
  matching: 'Соответствие',
  multiple_choice: 'Множественный выбор',
  sequence: 'Последовательность',
  table: 'Таблица',
};

// Названия уровней сложности
const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: 'Лёгкий',
  MEDIUM: 'Средний',
  HARD: 'Сложный',
};

// Названия предметов
const SUBJECT_LABELS: Record<string, string> = {
  MATHEMATICS: 'Математика',
  PHYSICS: 'Физика',
  CHEMISTRY: 'Химия',
  BIOLOGY: 'Биология',
  RUSSIAN: 'Русский язык',
  INFORMATICS: 'Информатика',
  HISTORY: 'История',
  ENGLISH: 'Английский язык',
};

// Советы по типам вопросов
const TYPE_ADVICE: Record<string, string[]> = {
  SINGLE_CHOICE: [
    'Внимательно читайте все варианты ответа перед выбором',
    'Исключайте заведомо неверные варианты методом отсечения',
    'Обращайте внимание на слова "всегда", "никогда", "только" - они часто указывают на неверный ответ',
  ],
  MULTIPLE_CHOICE: [
    'Рассматривайте каждый вариант как отдельное утверждение - верно или нет',
    'Не торопитесь - проверьте каждый пункт независимо от других',
    'Обычно правильных ответов 2-3, редко все или один',
  ],
  TEXT_INPUT: [
    'Проверяйте правописание и падежные окончания',
    'Следите за форматом ответа (число, слово, словосочетание)',
    'Перечитайте вопрос - убедитесь, что отвечаете именно на него',
  ],
  DETAILED_ANSWER: [
    'Составьте план ответа перед написанием',
    'Используйте термины и определения из учебника',
    'Проверьте, ответили ли вы на все части вопроса',
  ],
  short: [
    'Проверяйте правописание ответа',
    'Следите за форматом - число или слово',
    'Не добавляйте лишних слов и знаков',
  ],
  choice: [
    'Используйте метод исключения неверных вариантов',
    'Обращайте внимание на формулировку вопроса',
  ],
  matching: [
    'Сначала найдите очевидные пары',
    'Затем разберитесь с оставшимися методом исключения',
    'Проверьте все пары ещё раз перед ответом',
  ],
  multiple_choice: [
    'Каждый вариант оценивайте независимо',
    'Будьте внимательны к частичной правильности',
  ],
  sequence: [
    'Определите логику последовательности (хронология, причина-следствие)',
    'Начните с того, что точно знаете - первый или последний элемент',
  ],
  table: [
    'Заполняйте сначала те ячейки, в которых уверены',
    'Проверяйте логику по строкам и столбцам',
  ],
};

// Советы по темам
const TOPIC_ADVICE: Record<string, string[]> = {
  // Математика
  'Уравнения': [
    'Повторите правила переноса слагаемых',
    'Практикуйте решение линейных и квадратных уравнений',
    'Проверяйте корни подстановкой в исходное уравнение',
  ],
  'Геометрия': [
    'Выучите основные формулы площадей и объёмов',
    'Рисуйте чертежи даже для простых задач',
    'Помните теоремы о подобии и равенстве треугольников',
  ],
  'Функции': [
    'Повторите свойства линейной, квадратичной функций',
    'Практикуйте построение графиков',
    'Изучите связь между формулой и графиком',
  ],
  'Арифметика': [
    'Проверяйте вычисления дважды',
    'Используйте прикидку для оценки ответа',
  ],
  // Физика
  'Механика': [
    'Выучите три закона Ньютона и их применение',
    'Практикуйте задачи на кинематику',
    'Рисуйте схемы с силами для каждой задачи',
  ],
  'Электричество': [
    'Повторите закон Ома и правила Кирхгофа',
    'Практикуйте расчёт цепей с резисторами',
    'Разберитесь с понятиями напряжения, силы тока, сопротивления',
  ],
  // Русский язык
  'Орфография': [
    'Повторите правила правописания корней с чередованием',
    'Изучите правила написания приставок',
    'Практикуйте словарные слова',
  ],
  'Пунктуация': [
    'Выучите правила постановки запятых при однородных членах',
    'Разберитесь с обособленными определениями и обстоятельствами',
    'Практикуйте сложные предложения',
  ],
  'Грамматика': [
    'Повторите части речи и их признаки',
    'Изучите типы связи в словосочетаниях',
    'Практикуйте синтаксический разбор',
  ],
};

// Общие советы по сложности
const DIFFICULTY_ADVICE: Record<string, string> = {
  EASY: 'Базовые задания требуют знания определений и простых формул. Убедитесь, что вы понимаете основы.',
  MEDIUM: 'Задания среднего уровня требуют применения знаний. Практикуйте решение типовых задач.',
  HARD: 'Сложные задания требуют комбинирования знаний из разных тем. Решайте больше олимпиадных задач.',
};

interface AnalysisResult {
  // Общая статистика
  summary: {
    totalAttempts: number;
    totalQuestions: number;
    totalCorrect: number;
    totalWrong: number;
    overallAccuracy: number;
    averageTimePerQuestion: number;
  };

  // Анализ по типам вопросов
  byQuestionType: {
    type: string;
    typeLabel: string;
    total: number;
    correct: number;
    wrong: number;
    accuracy: number;
    avgTime: number;
    advice: string[];
  }[];

  // Анализ по сложности
  byDifficulty: {
    difficulty: string;
    difficultyLabel: string;
    total: number;
    correct: number;
    wrong: number;
    accuracy: number;
    advice: string;
  }[];

  // Анализ по темам (слабые места)
  weakTopics: {
    topic: string;
    subject: string;
    subjectLabel: string;
    total: number;
    correct: number;
    wrong: number;
    accuracy: number;
    trend: 'improving' | 'declining' | 'stable';
    advice: string[];
  }[];

  // Сильные темы
  strongTopics: {
    topic: string;
    subject: string;
    subjectLabel: string;
    accuracy: number;
    total: number;
  }[];

  // Частые ошибки (конкретные вопросы)
  frequentMistakes: {
    questionId: string;
    questionText: string;
    topic: string;
    subject: string;
    type: string;
    timesWrong: number;
    timesAttempted: number;
    commonWrongAnswer: string | null;
  }[];

  // Персональные рекомендации
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    actionItems: string[];
  }[];

  // Прогресс по времени
  progressOverTime: {
    date: string;
    accuracy: number;
    questionsCount: number;
  }[];
}

class ErrorAnalysisService {

  async getDetailedAnalysis(userId: string): Promise<AnalysisResult> {
    // Получаем все попытки с детальной информацией
    const attempts = await prisma.testAttempt.findMany({
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
      orderBy: { completedAt: 'asc' },
    });

    if (attempts.length === 0) {
      return this.getEmptyResult();
    }

    // Собираем статистику
    const stats = this.collectStats(attempts);

    // Анализируем по типам вопросов
    const byQuestionType = this.analyzeByQuestionType(stats);

    // Анализируем по сложности
    const byDifficulty = this.analyzeByDifficulty(stats);

    // Находим слабые темы
    const weakTopics = this.findWeakTopics(stats);

    // Находим сильные темы
    const strongTopics = this.findStrongTopics(stats);

    // Находим частые ошибки
    const frequentMistakes = this.findFrequentMistakes(stats);

    // Генерируем рекомендации
    const recommendations = this.generateRecommendations(stats, weakTopics, byQuestionType, byDifficulty);

    // Прогресс по времени
    const progressOverTime = this.calculateProgressOverTime(attempts);

    return {
      summary: {
        totalAttempts: attempts.length,
        totalQuestions: stats.totalQuestions,
        totalCorrect: stats.totalCorrect,
        totalWrong: stats.totalQuestions - stats.totalCorrect,
        overallAccuracy: stats.totalQuestions > 0
          ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
          : 0,
        averageTimePerQuestion: stats.totalTime > 0 && stats.questionsWithTime > 0
          ? Math.round(stats.totalTime / stats.questionsWithTime / 1000)
          : 0,
      },
      byQuestionType,
      byDifficulty,
      weakTopics,
      strongTopics,
      frequentMistakes,
      recommendations,
      progressOverTime,
    };
  }

  private collectStats(attempts: any[]) {
    const stats = {
      totalQuestions: 0,
      totalCorrect: 0,
      totalTime: 0,
      questionsWithTime: 0,
      byType: {} as Record<string, { total: number; correct: number; totalTime: number; count: number }>,
      byDifficulty: {} as Record<string, { total: number; correct: number }>,
      byTopic: {} as Record<string, {
        total: number;
        correct: number;
        subject: string;
        recentResults: boolean[];
      }>,
      byQuestion: {} as Record<string, {
        questionText: string;
        topic: string;
        subject: string;
        type: string;
        attempts: number;
        wrong: number;
        wrongAnswers: string[];
      }>,
    };

    attempts.forEach((attempt) => {
      try {
        const answers = JSON.parse(attempt.answers || '[]');
        const answerTimes = attempt.answerTimes ? JSON.parse(attempt.answerTimes) : [];
        const questionsOrder = attempt.questionsOrder ? JSON.parse(attempt.questionsOrder) : null;

        attempt.test.questions.forEach((tq: any, index: number) => {
          const question = tq.question;
          const questionId = question.id;
          const type = question.type || 'unknown';
          const difficulty = question.difficulty || 'MEDIUM';
          const topic = question.topic || 'Общие вопросы';
          const subject = question.subject;
          const topicKey = `${subject}:${topic}`;

          // Находим ответ пользователя
          const questionIndex = questionsOrder
            ? questionsOrder.indexOf(questionId)
            : index;

          let userAnswer = null;
          let isCorrect = false;
          let timeSpent = 0;

          if (questionIndex >= 0 && answers[questionIndex] !== undefined) {
            userAnswer = answers[questionIndex];
            if (typeof userAnswer === 'object' && userAnswer !== null) {
              userAnswer = userAnswer.answer || userAnswer;
            }

            let correctAnswer = question.correctAnswer;
            try {
              correctAnswer = JSON.parse(correctAnswer);
            } catch {}

            isCorrect = this.checkAnswer(userAnswer, correctAnswer);

            if (answerTimes[questionIndex]) {
              timeSpent = answerTimes[questionIndex];
              stats.totalTime += timeSpent;
              stats.questionsWithTime++;
            }
          }

          stats.totalQuestions++;
          if (isCorrect) stats.totalCorrect++;

          // По типу
          if (!stats.byType[type]) {
            stats.byType[type] = { total: 0, correct: 0, totalTime: 0, count: 0 };
          }
          stats.byType[type].total++;
          if (isCorrect) stats.byType[type].correct++;
          if (timeSpent > 0) {
            stats.byType[type].totalTime += timeSpent;
            stats.byType[type].count++;
          }

          // По сложности
          if (!stats.byDifficulty[difficulty]) {
            stats.byDifficulty[difficulty] = { total: 0, correct: 0 };
          }
          stats.byDifficulty[difficulty].total++;
          if (isCorrect) stats.byDifficulty[difficulty].correct++;

          // По теме
          if (!stats.byTopic[topicKey]) {
            stats.byTopic[topicKey] = { total: 0, correct: 0, subject, recentResults: [] };
          }
          stats.byTopic[topicKey].total++;
          if (isCorrect) stats.byTopic[topicKey].correct++;
          stats.byTopic[topicKey].recentResults.push(isCorrect);
          // Храним только последние 10 результатов для определения тренда
          if (stats.byTopic[topicKey].recentResults.length > 10) {
            stats.byTopic[topicKey].recentResults.shift();
          }

          // По вопросу (для частых ошибок)
          if (!stats.byQuestion[questionId]) {
            stats.byQuestion[questionId] = {
              questionText: question.question.substring(0, 200),
              topic,
              subject,
              type,
              attempts: 0,
              wrong: 0,
              wrongAnswers: [],
            };
          }
          stats.byQuestion[questionId].attempts++;
          if (!isCorrect) {
            stats.byQuestion[questionId].wrong++;
            if (userAnswer !== null) {
              stats.byQuestion[questionId].wrongAnswers.push(String(userAnswer));
            }
          }
        });
      } catch (e) {
        console.error('Error processing attempt:', e);
      }
    });

    return stats;
  }

  private checkAnswer(userAnswer: any, correctAnswer: any): boolean {
    if (userAnswer === null || userAnswer === undefined) return false;

    const normalizeAnswer = (ans: any) => String(ans).toLowerCase().trim();

    if (Array.isArray(correctAnswer)) {
      if (Array.isArray(userAnswer)) {
        return JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswer.sort());
      }
      return correctAnswer.map(normalizeAnswer).includes(normalizeAnswer(userAnswer));
    }

    return normalizeAnswer(correctAnswer) === normalizeAnswer(userAnswer);
  }

  private analyzeByQuestionType(stats: any) {
    return Object.entries(stats.byType)
      .map(([type, data]: [string, any]) => ({
        type,
        typeLabel: QUESTION_TYPE_LABELS[type] || type,
        total: data.total,
        correct: data.correct,
        wrong: data.total - data.correct,
        accuracy: Math.round((data.correct / data.total) * 100),
        avgTime: data.count > 0 ? Math.round(data.totalTime / data.count / 1000) : 0,
        advice: TYPE_ADVICE[type] || ['Практикуйте больше заданий этого типа'],
      }))
      .sort((a, b) => a.accuracy - b.accuracy);
  }

  private analyzeByDifficulty(stats: any) {
    const order = ['EASY', 'MEDIUM', 'HARD'];
    return order
      .filter(d => stats.byDifficulty[d])
      .map(difficulty => {
        const data = stats.byDifficulty[difficulty];
        return {
          difficulty,
          difficultyLabel: DIFFICULTY_LABELS[difficulty] || difficulty,
          total: data.total,
          correct: data.correct,
          wrong: data.total - data.correct,
          accuracy: Math.round((data.correct / data.total) * 100),
          advice: DIFFICULTY_ADVICE[difficulty] || '',
        };
      });
  }

  private findWeakTopics(stats: any) {
    return Object.entries(stats.byTopic)
      .filter(([_, data]: [string, any]) => data.total >= 2)
      .map(([key, data]: [string, any]) => {
        const [subject, topic] = key.split(':');
        const accuracy = Math.round((data.correct / data.total) * 100);
        const trend = this.calculateTrend(data.recentResults);

        return {
          topic,
          subject,
          subjectLabel: SUBJECT_LABELS[subject] || subject,
          total: data.total,
          correct: data.correct,
          wrong: data.total - data.correct,
          accuracy,
          trend,
          advice: TOPIC_ADVICE[topic] || [
            `Повторите теорию по теме "${topic}"`,
            'Решите больше практических заданий',
            'Разберите типичные ошибки',
          ],
        };
      })
      .filter(t => t.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 10);
  }

  private findStrongTopics(stats: any) {
    return Object.entries(stats.byTopic)
      .filter(([_, data]: [string, any]) => data.total >= 3)
      .map(([key, data]: [string, any]) => {
        const [subject, topic] = key.split(':');
        const accuracy = Math.round((data.correct / data.total) * 100);
        return {
          topic,
          subject,
          subjectLabel: SUBJECT_LABELS[subject] || subject,
          accuracy,
          total: data.total,
        };
      })
      .filter(t => t.accuracy >= 80)
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 5);
  }

  private calculateTrend(results: boolean[]): 'improving' | 'declining' | 'stable' {
    if (results.length < 4) return 'stable';

    const mid = Math.floor(results.length / 2);
    const firstHalf = results.slice(0, mid);
    const secondHalf = results.slice(mid);

    const firstRate = firstHalf.filter(r => r).length / firstHalf.length;
    const secondRate = secondHalf.filter(r => r).length / secondHalf.length;

    const diff = secondRate - firstRate;
    if (diff > 0.15) return 'improving';
    if (diff < -0.15) return 'declining';
    return 'stable';
  }

  private findFrequentMistakes(stats: any) {
    return Object.entries(stats.byQuestion)
      .filter(([_, data]: [string, any]) => data.wrong >= 2 && data.attempts >= 2)
      .map(([questionId, data]: [string, any]) => {
        // Находим самый частый неправильный ответ
        const wrongCounts: Record<string, number> = {};
        data.wrongAnswers.forEach((ans: string) => {
          wrongCounts[ans] = (wrongCounts[ans] || 0) + 1;
        });

        let commonWrongAnswer: string | null = null;
        let maxCount = 0;
        Object.entries(wrongCounts).forEach(([ans, count]) => {
          if (count > maxCount) {
            maxCount = count;
            commonWrongAnswer = ans;
          }
        });

        return {
          questionId,
          questionText: data.questionText,
          topic: data.topic,
          subject: data.subject,
          type: data.type,
          timesWrong: data.wrong,
          timesAttempted: data.attempts,
          commonWrongAnswer: maxCount >= 2 ? commonWrongAnswer : null,
        };
      })
      .sort((a, b) => b.timesWrong - a.timesWrong)
      .slice(0, 10);
  }

  private generateRecommendations(
    stats: any,
    weakTopics: any[],
    byType: any[],
    byDifficulty: any[]
  ) {
    const recommendations: any[] = [];

    // Рекомендации по слабым темам
    if (weakTopics.length > 0) {
      const worstTopic = weakTopics[0];
      recommendations.push({
        priority: 'high',
        category: 'Слабые темы',
        title: `Уделите внимание теме "${worstTopic.topic}"`,
        description: `Ваша точность по этой теме всего ${worstTopic.accuracy}%. Это одна из ваших самых слабых областей.`,
        actionItems: worstTopic.advice,
      });
    }

    // Рекомендации по типам вопросов
    const worstType = byType.find(t => t.accuracy < 60);
    if (worstType) {
      recommendations.push({
        priority: 'high',
        category: 'Типы заданий',
        title: `Практикуйте задания типа "${worstType.typeLabel}"`,
        description: `Точность ${worstType.accuracy}% — ниже среднего. Эти задания требуют дополнительной практики.`,
        actionItems: worstType.advice,
      });
    }

    // Рекомендации по сложности
    const easyStats = byDifficulty.find(d => d.difficulty === 'EASY');
    const hardStats = byDifficulty.find(d => d.difficulty === 'HARD');

    if (easyStats && easyStats.accuracy < 80) {
      recommendations.push({
        priority: 'high',
        category: 'Базовые знания',
        title: 'Укрепите базовые знания',
        description: `Даже в лёгких заданиях точность ${easyStats.accuracy}%. Начните с повторения основ.`,
        actionItems: [
          'Перечитайте теорию в учебнике',
          'Выучите основные определения и формулы',
          'Решайте простые задачи до автоматизма',
        ],
      });
    }

    if (hardStats && hardStats.accuracy > 50 && easyStats && easyStats.accuracy > 85) {
      recommendations.push({
        priority: 'medium',
        category: 'Развитие',
        title: 'Переходите к олимпиадным задачам',
        description: 'Вы хорошо справляетесь с базовыми заданиями. Пора усложнять!',
        actionItems: [
          'Попробуйте задания повышенной сложности',
          'Участвуйте в олимпиадах',
          'Изучите нестандартные методы решения',
        ],
      });
    }

    // Общие рекомендации по времени
    const avgTime = stats.questionsWithTime > 0
      ? stats.totalTime / stats.questionsWithTime / 1000
      : 0;

    if (avgTime > 180) { // больше 3 минут на вопрос
      recommendations.push({
        priority: 'medium',
        category: 'Тайм-менеджмент',
        title: 'Работайте над скоростью',
        description: `Среднее время ${Math.round(avgTime)} сек на вопрос. На экзамене это может быть проблемой.`,
        actionItems: [
          'Засекайте время при решении задач',
          'Если застряли — переходите к следующему вопросу',
          'Автоматизируйте типовые операции',
        ],
      });
    }

    // Рекомендация по ухудшающимся темам
    const decliningTopics = weakTopics.filter(t => t.trend === 'declining');
    if (decliningTopics.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Внимание',
        title: 'Результаты ухудшаются',
        description: `По темам ${decliningTopics.map(t => `"${t.topic}"`).join(', ')} наблюдается спад. Требуется повторение.`,
        actionItems: [
          'Вернитесь к этим темам и повторите теорию',
          'Разберите свои ошибки',
          'Сделайте перерыв, если чувствуете усталость',
        ],
      });
    }

    // Если мало рекомендаций — добавляем общую
    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'low',
        category: 'Общее',
        title: 'Продолжайте в том же духе!',
        description: 'Ваши результаты хорошие. Продолжайте регулярно практиковаться.',
        actionItems: [
          'Поддерживайте регулярность занятий',
          'Пробуйте новые темы и предметы',
          'Участвуйте в соревнованиях на платформе',
        ],
      });
    }

    return recommendations.slice(0, 5);
  }

  private calculateProgressOverTime(attempts: any[]) {
    const byDate: Record<string, { correct: number; total: number }> = {};

    attempts.forEach(attempt => {
      if (!attempt.completedAt) return;

      const date = new Date(attempt.completedAt).toISOString().split('T')[0];
      if (!byDate[date]) {
        byDate[date] = { correct: 0, total: 0 };
      }

      try {
        const answers = JSON.parse(attempt.answers || '[]');
        const questionsOrder = attempt.questionsOrder ? JSON.parse(attempt.questionsOrder) : null;

        attempt.test.questions.forEach((tq: any, index: number) => {
          const question = tq.question;
          const questionIndex = questionsOrder
            ? questionsOrder.indexOf(question.id)
            : index;

          byDate[date].total++;

          if (questionIndex >= 0 && answers[questionIndex] !== undefined) {
            let userAnswer = answers[questionIndex];
            if (typeof userAnswer === 'object' && userAnswer !== null) {
              userAnswer = userAnswer.answer || userAnswer;
            }

            let correctAnswer = question.correctAnswer;
            try {
              correctAnswer = JSON.parse(correctAnswer);
            } catch {}

            if (this.checkAnswer(userAnswer, correctAnswer)) {
              byDate[date].correct++;
            }
          }
        });
      } catch (e) {}
    });

    return Object.entries(byDate)
      .map(([date, data]) => ({
        date,
        accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
        questionsCount: data.total,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // последние 30 дней
  }

  private getEmptyResult(): AnalysisResult {
    return {
      summary: {
        totalAttempts: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        totalWrong: 0,
        overallAccuracy: 0,
        averageTimePerQuestion: 0,
      },
      byQuestionType: [],
      byDifficulty: [],
      weakTopics: [],
      strongTopics: [],
      frequentMistakes: [],
      recommendations: [{
        priority: 'low',
        category: 'Начало',
        title: 'Пройдите первый тест',
        description: 'Для анализа ошибок нужно сначала пройти хотя бы один тест.',
        actionItems: [
          'Выберите предмет на главной странице',
          'Пройдите тест до конца',
          'Вернитесь сюда для анализа результатов',
        ],
      }],
      progressOverTime: [],
    };
  }
}

export default new ErrorAnalysisService();

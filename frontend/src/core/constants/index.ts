import type { Subject, Grade } from '../types';

export const EXAM_CONFIG = {
  OGE: {
    duration: 235,
    title: 'ОГЭ',
    description: 'Основной государственный экзамен',
    grade: 9 as Grade,
  },
  EGE: {
    duration: 235,
    title: 'ЕГЭ',
    description: 'Единый государственный экзамен',
    grade: 11 as Grade,
  },
  EGE_PROFILE: {
    duration: 235,
    title: 'ЕГЭ (Профильный)',
    description: 'Единый государственный экзамен профильного уровня',
    grade: 11 as Grade,
  },
  EGE_BASE: {
    duration: 180,
    title: 'ЕГЭ (Базовый)',
    description: 'Единый государственный экзамен базового уровня',
    grade: 11 as Grade,
  },
  VPR: {
    duration: 90,
    title: 'ВПР',
    description: 'Всероссийская проверочная работа',
    grade: 8 as Grade,
  },
  REGULAR: {
    duration: 30,
    title: 'Тест',
    description: 'Тренировочный тест',
    grade: 8 as Grade,
  },
} as const;

export const TIMER_CONFIG = {
  warningThreshold: 0.25,
  criticalThreshold: 0.1,
  tickInterval: 1000,
} as const;

export const SUBJECT_NAMES: Record<Subject, string> = {
  MATHEMATICS: 'Математика',
  PHYSICS: 'Физика',
  CHEMISTRY: 'Химия',
  BIOLOGY: 'Биология',
  RUSSIAN: 'Русский язык',
  INFORMATICS: 'Информатика',
  HISTORY: 'История',
  ENGLISH: 'Английский язык',
  SOCIAL: 'Обществознание',
} as const;

export const SUBJECT_ICONS: Record<Subject, string> = {
  MATHEMATICS: '🔢',
  PHYSICS: '⚛️',
  CHEMISTRY: '🧪',
  BIOLOGY: '🧬',
  RUSSIAN: '📖',
  INFORMATICS: '💻',
  HISTORY: '📜',
  ENGLISH: '🇬🇧',
  SOCIAL: '🌐',
} as const;

export const SUBJECT_COLORS: Record<Subject, { from: string; to: string }> = {
  MATHEMATICS: { from: 'cyan-500', to: 'blue-500' },
  PHYSICS: { from: 'purple-500', to: 'pink-500' },
  CHEMISTRY: { from: 'green-500', to: 'emerald-500' },
  BIOLOGY: { from: 'lime-500', to: 'green-500' },
  RUSSIAN: { from: 'red-500', to: 'orange-500' },
  INFORMATICS: { from: 'blue-500', to: 'indigo-500' },
  HISTORY: { from: 'amber-500', to: 'yellow-500' },
  ENGLISH: { from: 'sky-500', to: 'blue-500' },
  SOCIAL: { from: 'teal-500', to: 'cyan-500' },
} as const;

export const QUESTION_TYPE_INFO = {
  short: {
    name: 'Краткий ответ',
    description: 'Введите ответ в поле',
    icon: '✏️',
  },
  choice: {
    name: 'Выбор ответа',
    description: 'Выберите один правильный ответ',
    icon: '🔘',
  },
  matching: {
    name: 'Соответствие',
    description: 'Установите соответствие',
    icon: '🔗',
  },
  multiple_choice: {
    name: 'Множественный выбор',
    description: 'Выберите все правильные ответы',
    icon: '☑️',
  },
  detailed: {
    name: 'Развернутый ответ',
    description: 'Запишите подробное решение',
    icon: '📝',
  },
  proof: {
    name: 'Доказательство',
    description: 'Запишите доказательство',
    icon: '📐',
  },
} as const;

export const STORAGE_KEYS = {
  TEST_SESSION: 'lyceum64_test_session',
  USER_PREFERENCES: 'lyceum64_user_preferences',
  LAST_EXAM: 'lyceum64_last_exam',
  ANSWERS_BACKUP: 'lyceum64_answers_backup',
} as const;

export const MESSAGES = {
  TEST_COMPLETED: 'Тест успешно завершён!',
  TIME_EXPIRED: 'Время истекло!',
  ANSWER_SAVED: 'Ответ сохранён',
  SESSION_RESTORED: 'Сессия восстановлена',
  ERROR_LOADING_EXAM: 'Ошибка загрузки экзамена',
  CONFIRM_FINISH: 'Вы уверены, что хотите завершить тест?',
  UNANSWERED_WARNING: 'У вас есть неотвеченные вопросы. Продолжить?',
} as const;

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  TEST_SETUP: '/test/setup/:subject',
  EGE_TYPE: '/test/ege-type',
  EXAM: '/test/exam',
  RESULTS: '/test/results',
} as const;

export const ANIMATION_CLASSES = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  scaleIn: 'animate-scale-in',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
} as const;

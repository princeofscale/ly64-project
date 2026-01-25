/**
 * Application Constants
 * Централизованные константы приложения
 */

import { Subject, Grade } from '../types';

/**
 * Конфигурация экзаменов
 */
export const EXAM_CONFIG = {
  OGE: {
    duration: 235, // 3 часа 55 минут
    title: 'ОГЭ',
    description: 'Основной государственный экзамен',
    grade: 9 as Grade,
  },
  EGE_PROFILE: {
    duration: 235, // 3 часа 55 минут
    title: 'ЕГЭ (Профильный)',
    description: 'Единый государственный экзамен профильного уровня',
    grade: 11 as Grade,
  },
  EGE_BASE: {
    duration: 180, // 3 часа
    title: 'ЕГЭ (Базовый)',
    description: 'Единый государственный экзамен базового уровня',
    grade: 11 as Grade,
  },
  REGULAR: {
    duration: 30,
    title: 'Тест',
    description: 'Тренировочный тест',
    grade: 8 as Grade,
  },
} as const;

/**
 * Конфигурация таймера
 */
export const TIMER_CONFIG = {
  warningThreshold: 0.25, // 25% времени осталось
  criticalThreshold: 0.1, // 10% времени осталось
  tickInterval: 1000, // 1 секунда
} as const;

/**
 * Названия предметов
 */
export const SUBJECT_NAMES: Record<Subject, string> = {
  MATHEMATICS: 'Математика',
  PHYSICS: 'Физика',
  CHEMISTRY: 'Химия',
  BIOLOGY: 'Биология',
  RUSSIAN: 'Русский язык',
  INFORMATICS: 'Информатика',
} as const;

/**
 * Иконки предметов
 */
export const SUBJECT_ICONS: Record<Subject, string> = {
  MATHEMATICS: '🔢',
  PHYSICS: '⚛️',
  CHEMISTRY: '🧪',
  BIOLOGY: '🧬',
  RUSSIAN: '📖',
  INFORMATICS: '💻',
} as const;

/**
 * Цветовые схемы предметов
 */
export const SUBJECT_COLORS: Record<Subject, { from: string; to: string }> = {
  MATHEMATICS: { from: 'cyan-500', to: 'blue-500' },
  PHYSICS: { from: 'purple-500', to: 'pink-500' },
  CHEMISTRY: { from: 'green-500', to: 'emerald-500' },
  BIOLOGY: { from: 'lime-500', to: 'green-500' },
  RUSSIAN: { from: 'red-500', to: 'orange-500' },
  INFORMATICS: { from: 'blue-500', to: 'indigo-500' },
} as const;

/**
 * Типы вопросов с описанием
 */
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

/**
 * Ключи для localStorage
 */
export const STORAGE_KEYS = {
  TEST_SESSION: 'lyceum64_test_session',
  USER_PREFERENCES: 'lyceum64_user_preferences',
  LAST_EXAM: 'lyceum64_last_exam',
  ANSWERS_BACKUP: 'lyceum64_answers_backup',
} as const;

/**
 * Сообщения приложения
 */
export const MESSAGES = {
  TEST_COMPLETED: 'Тест успешно завершён!',
  TIME_EXPIRED: 'Время истекло!',
  ANSWER_SAVED: 'Ответ сохранён',
  SESSION_RESTORED: 'Сессия восстановлена',
  ERROR_LOADING_EXAM: 'Ошибка загрузки экзамена',
  CONFIRM_FINISH: 'Вы уверены, что хотите завершить тест?',
  UNANSWERED_WARNING: 'У вас есть неотвеченные вопросы. Продолжить?',
} as const;

/**
 * Маршруты приложения
 */
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  TEST_SETUP: '/test/setup/:subject',
  EGE_TYPE: '/test/ege-type',
  EXAM: '/test/exam',
  RESULTS: '/test/results',
  DIAGNOSTIC: '/diagnostic',
} as const;

/**
 * CSS классы для анимаций
 */
export const ANIMATION_CLASSES = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  scaleIn: 'animate-scale-in',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
} as const;

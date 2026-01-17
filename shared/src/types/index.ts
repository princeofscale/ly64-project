// Статус пользователя
export enum UserStatus {
  STUDENT = 'STUDENT', // Уже учится в лицее
  APPLICANT = 'APPLICANT', // Хочет поступить
}

// Провайдер аутентификации
export enum AuthProvider {
  EMAIL = 'EMAIL',
  DNEVNIK = 'DNEVNIK',
}

// Типы пользователей
export interface User {
  id: string;
  email: string;
  name: string;
  status: UserStatus;
  currentGrade: number; // Текущий класс (8-11)
  desiredDirection?: Direction;
  motivation?: string; // Почему хочет поступить (только для APPLICANT)
  authProvider: AuthProvider;
  dnevnikId?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Достижение пользователя
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string; // Условие получения
  points: number; // Баллы за достижение
}

// Достижения пользователя
export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: Date;
}

// Типы направлений обучения
export enum Direction {
  PROGRAMMING = 'PROGRAMMING',
  ROBOTICS = 'ROBOTICS',
  MEDICINE = 'MEDICINE',
  BIOTECHNOLOGY = 'BIOTECHNOLOGY',
  CULTURE = 'CULTURE',
}

// Типы предметов
export enum Subject {
  RUSSIAN = 'RUSSIAN',
  MATHEMATICS = 'MATHEMATICS',
  PHYSICS = 'PHYSICS',
  INFORMATICS = 'INFORMATICS',
  BIOLOGY = 'BIOLOGY',
  HISTORY = 'HISTORY',
  ENGLISH = 'ENGLISH',
}

// Типы классов для поступления
export enum TargetGrade {
  GRADE_8 = 'GRADE_8',
  GRADE_10 = 'GRADE_10',
}

// Типы экзаменов
export enum ExamType {
  LYCEUM_ENTRANCE = 'LYCEUM_ENTRANCE', // Вступительный экзамен в лицей
  OGE = 'OGE', // ОГЭ
  EGE = 'EGE', // ЕГЭ
}

// Типы вопросов
export enum QuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE', // Одиночный выбор
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE', // Множественный выбор
  TEXT_INPUT = 'TEXT_INPUT', // Текстовый ввод
  DETAILED_ANSWER = 'DETAILED_ANSWER', // Развернутый ответ
}

// Уровень сложности
export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

// Интерфейс вопроса
export interface Question {
  id: string;
  subject: Subject;
  examType: ExamType;
  targetGrade?: TargetGrade;
  type: QuestionType;
  difficulty: DifficultyLevel;
  question: string;
  options?: string[]; // Для вопросов с выбором
  correctAnswer: string | string[]; // Правильный ответ
  explanation?: string; // Объяснение правильного ответа
  topic?: string; // Тема вопроса
  createdAt: Date;
  updatedAt: Date;
}

// Интерфейс теста
export interface Test {
  id: string;
  title: string;
  description?: string;
  subject: Subject;
  examType: ExamType;
  targetGrade?: TargetGrade;
  questions: Question[];
  timeLimit?: number; // В минутах
  passingScore?: number; // Минимальный балл для прохождения (в процентах)
  createdAt: Date;
  updatedAt: Date;
}

// Интерфейс попытки прохождения теста
export interface TestAttempt {
  id: string;
  userId: string;
  testId: string;
  answers: {
    questionId: string;
    answer: string | string[];
  }[];
  score?: number; // Балл (в процентах)
  completedAt?: Date;
  startedAt: Date;
}

// Интерфейс статистики пользователя
export interface UserStats {
  userId: string;
  subject: Subject;
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  lastAttemptDate?: Date;
}

// Интерфейс прогресса пользователя
export interface UserProgress {
  userId: string;
  direction?: Direction;
  targetGrade?: TargetGrade;
  completedTests: string[];
  stats: UserStats[];
  createdAt: Date;
  updatedAt: Date;
}

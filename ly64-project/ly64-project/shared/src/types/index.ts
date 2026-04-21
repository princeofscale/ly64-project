export enum UserStatus {
  STUDENT = 'STUDENT',
  APPLICANT = 'APPLICANT',
}

export enum AuthProvider {
  EMAIL = 'EMAIL',
}

export interface User {
  id: string;
  email: string;
  name: string;
  status: UserStatus;
  currentGrade: number;
  desiredDirection?: Direction;
  motivation?: string;
  authProvider: AuthProvider;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AchievementRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  points: number;
  rutheniumReward?: number;
  rarity?: AchievementRarity;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: Date;
}

export enum Direction {
  PROGRAMMING = 'PROGRAMMING',
  ROBOTICS = 'ROBOTICS',
  MEDICINE = 'MEDICINE',
  BIOTECHNOLOGY = 'BIOTECHNOLOGY',
  CULTURE = 'CULTURE',
}

export enum Subject {
  RUSSIAN = 'RUSSIAN',
  MATHEMATICS = 'MATHEMATICS',
  PHYSICS = 'PHYSICS',
  INFORMATICS = 'INFORMATICS',
  BIOLOGY = 'BIOLOGY',
  CHEMISTRY = 'CHEMISTRY',
  HISTORY = 'HISTORY',
  ENGLISH = 'ENGLISH',
}

export enum TargetGrade {
  GRADE_8 = 'GRADE_8',
  GRADE_10 = 'GRADE_10',
}

export enum ExamType {
  LYCEUM_ENTRANCE = 'LYCEUM_ENTRANCE',
  OGE = 'OGE',
  EGE = 'EGE',
}

export enum QuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TEXT_INPUT = 'TEXT_INPUT',
  DETAILED_ANSWER = 'DETAILED_ANSWER',
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export interface Question {
  id: string;
  subject: Subject;
  examType: ExamType;
  targetGrade?: TargetGrade;
  type: QuestionType;
  difficulty: DifficultyLevel;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  topic?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Test {
  id: string;
  title: string;
  description?: string;
  subject: Subject;
  examType: ExamType;
  targetGrade?: TargetGrade;
  questions: Question[];
  timeLimit?: number;
  passingScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestAttempt {
  id: string;
  userId: string;
  testId: string;
  answers: {
    questionId: string;
    answer: string | string[];
  }[];
  score?: number;
  completedAt?: Date;
  startedAt: Date;
}

export interface UserStats {
  userId: string;
  subject: Subject;
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  lastAttemptDate?: Date;
}

export interface UserProgress {
  userId: string;
  direction?: Direction;
  targetGrade?: TargetGrade;
  completedTests: string[];
  stats: UserStats[];
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// Rocket Game (Ракетка)
// ==========================================

export type RocketRoundStatus = 'BETTING' | 'RUNNING' | 'CRASHED';

export type RocketBetStatus = 'ACTIVE' | 'CASHED_OUT' | 'LOST';

export interface RocketPublicBet {
  userId: string;
  username: string;
  name: string;
  avatar: string | null;
  amount: number;
  cashOutMultiplier?: number;
  winAmount?: number;
  status: RocketBetStatus;
}

export interface RocketHistoryEntry {
  id: string;
  crashMultiplier: number;
  endedAt: string;
}

export interface RocketRoundState {
  roundId: string;
  status: RocketRoundStatus;
  multiplier: number;
  bettingEndsAt?: number;
  startedAt?: number;
  crashedAt?: number;
  crashMultiplier?: number;
  clientSeedHash: string;
  bets: RocketPublicBet[];
  history: RocketHistoryEntry[];
  onlineCount: number;
}

export interface RocketBetHistoryItem {
  id: string;
  roundId: string;
  amount: number;
  cashOutMultiplier: number | null;
  winAmount: number;
  status: RocketBetStatus;
  crashMultiplier: number;
  createdAt: string;
}

export interface RocketStats {
  totalBets: number;
  totalWagered: number;
  totalWon: number;
  netProfit: number;
  biggestWin: number;
  biggestMultiplier: number;
  longestWinStreak: number;
}

export interface RocketLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  name: string;
  avatar: string | null;
  totalWon: number;
  totalWagered: number;
  netProfit: number;
  bets: number;
}

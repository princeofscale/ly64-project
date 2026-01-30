export type QuestionType =
  | 'short'
  | 'choice'
  | 'matching'
  | 'multiple_choice'
  | 'detailed'
  | 'proof';

export type ExamType = 'OGE' | 'EGE' | 'EGE_PROFILE' | 'EGE_BASE' | 'VPR' | 'REGULAR';

export type Subject =
  | 'MATHEMATICS'
  | 'PHYSICS'
  | 'CHEMISTRY'
  | 'BIOLOGY'
  | 'RUSSIAN'
  | 'INFORMATICS'
  | 'HISTORY'
  | 'ENGLISH';

export type Grade = 8 | 9 | 10 | 11;

export type AnswerStatus = 'unanswered' | 'answered' | 'skipped' | 'flagged';

export type TestStatus = 'not_started' | 'in_progress' | 'paused' | 'completed' | 'time_expired';

export type ValidationResult = {
  isCorrect: boolean;
  earnedPoints: number;
  maxPoints: number;
  feedback?: string;
};

export type TimerConfig = {
  duration: number;
  warningThreshold: number;
  criticalThreshold: number;
};

export type TimerState = {
  timeLeft: number;
  isRunning: boolean;
  isPaused: boolean;
  status: 'normal' | 'warning' | 'critical';
};

export type UserAnswer = {
  taskNumber: number;
  value: string;
  timestamp: Date;
  status: AnswerStatus;
};

export type TestResults = {
  totalTasks: number;
  answeredTasks: number;
  correctAnswers: number;
  earnedPoints: number;
  maxPoints: number;
  percentageScore: number;
  timeSpent: number;
  completedAt: Date;
};

export type TaskDTO = {
  number: number;
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
  points: number;
  topic: string;
  detailedSolution?: boolean;
  requiresProof?: boolean;
};

export type ExamDTO = {
  subject: Subject;
  grade: Grade;
  examType: ExamType;
  duration: number;
  tasks: TaskDTO[];
};

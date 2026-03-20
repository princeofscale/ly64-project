export interface TheoryExample {
  problem: string;
  solution: string;
  answer: string;
}

export interface TheorySection {
  id: string;
  title: string;
  content: string;
  formulas?: string[];
  examples?: TheoryExample[];
  tips?: string[];
}

export interface TheoryTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  tasks: number[];
  keywords?: string[];
  sections: TheorySection[];
}

export type SubjectKey =
  | 'MATHEMATICS'
  | 'PHYSICS'
  | 'RUSSIAN'
  | 'INFORMATICS'
  | 'BIOLOGY'
  | 'CHEMISTRY'
  | 'SOCIAL';

export interface SubjectTheory {
  subject: SubjectKey;
  label: string;
  icon: string;
  topics: TheoryTopic[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  description: string;
  questionCount: number;
}

export interface Question {
  id: string;
  skillCategoryId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizAttempt {
  id: string;
  userId: string;
  skillCategoryId: string;
  questions: QuestionResult[];
  score: number;
  totalQuestions: number;
  completedAt: string;
  timeSpent: number; // in seconds
}

export interface QuestionResult {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

export interface UserPerformance {
  userId: string;
  userName: string;
  skillCategory: string;
  averageScore: number;
  totalAttempts: number;
  lastAttempt: string;
  skillGap: 'high' | 'medium' | 'low';
}
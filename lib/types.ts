// User Profile Types
export type LearningMode = 'standard' | 'dyslexia' | 'adhd';

export interface WeightedProfile {
  standard: number; // 0-100
  dyslexia: number; // 0-100
  adhd: number; // 0-100
}

export interface StudentProfile {
  id: string;
  userId: string;
  weightedProfile: WeightedProfile;
  preferredMode: LearningMode;
  readingSpeed: 'slow' | 'normal' | 'fast';
  focusSpan: 'short' | 'medium' | 'long';
  colorPreference: 'light' | 'dark' | 'sepia';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
  createdAt: Date;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  bio: string;
  school: string;
  createdAt: Date;
}

export interface LearningContent {
  id: string;
  title: string;
  originalText: string;
  adaptedText: string;
  category: string;
  difficulty: string;
  estimatedReadTime: number;
  keyTerms: string[];
  createdAt: Date;
}

export interface LearningProgress {
  id: string;
  studentId: string;
  contentId: string;
  wordsRead: number;
  comprehensionScore: number;
  timeSpent: number;
  completedAt?: Date;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  studentId: string;
  badge: string;
  description: string;
  unlockedAt: Date;
}

export interface DailyStreak {
  id: string;
  studentId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  updatedAt: Date;
}

export interface AIConversation {
  id: string;
  studentId: string;
  contentId?: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
}

export interface TextTransformationResult {
  original: string;
  transformed: string;
  bionicReading: string;
  chunks: string[];
  keyTerms: Array<{
    term: string;
    explanation: string;
  }>;
  quiz: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
}

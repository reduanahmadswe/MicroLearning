// User & Auth Types
export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'learner' | 'instructor' | 'admin';
  profilePicture?: string;
  bio?: string;
  phone?: string;
  xp: number;
  level: number;
  streak: number;
  totalLessonsCompleted: number;
  totalQuizzesCompleted: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Lesson Types
export interface Lesson {
  _id: string;
  title: string;
  content: string;
  summary: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  author: User;
  tags: string[];
  description?: string;
  views: number;
  likes: number;
  likedBy?: string[]; // Array of user IDs who liked this lesson
  isPublished: boolean;
  isCompleted?: boolean;
  aiGenerated?: boolean;
  audioUrl?: string;
  thumbnailUrl?: string;
  course?: string | { _id: string; title: string }; // Course ID reference or populated course
  order?: number; // Lesson order in course
  media?: Array<{
    type: 'video' | 'audio' | 'image';
    url: string;
    thumbnail?: string;
    duration?: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Quiz Types
export interface Quiz {
  _id: string;
  title: string;
  description: string;
  lesson?: string;
  questions: Question[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit?: number;
  passingScore: number;
  totalAttempts: number;
  createdAt: string;
}

export interface Question {
  _id: string;
  question: string;
  type: 'mcq' | 'true-false' | 'fill-blank';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  points: number;
}

export interface QuizResult {
  _id: string;
  quiz: Quiz;
  user: string;
  answers: any[];
  score: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  completedAt: string;
}

// Course Types
export interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  thumbnailUrl?: string; // Database field name
  instructor: User;
  lessons: Lesson[];
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  enrolledCount: number;
  rating: number;
  price: number;
  isPremium: boolean;
  isPublished: boolean;
  createdAt: string;
}

export interface Enrollment {
  _id: string;
  course: Course;
  user: string;
  progress: number;
  completedLessons: string[];
  enrolledAt: string;
  completedAt?: string;
}

// Progress Types
export interface Progress {
  _id: string;
  user: string;
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lessonsCompleted: number;
  quizzesCompleted: number;
  coursesCompleted: number;
  studyTimeMinutes: number;
  lastActiveDate: string;
}

// Badge Types
export interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category?: string;
  requirement?: string;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedBy?: number;
  color?: string;
  isActive?: boolean;
  criteria: {
    type: 'streak' | 'lessons_completed' | 'quiz_perfect' | 'xp_milestone' | 'flashcard_mastered' | 'topic_mastered';
    threshold: number;
    topic?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface UserBadge {
  badge: Badge;
  unlockedAt: string;
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number;
  user: User;
  xp: number;
  level: number;
  lessonsCompleted: number;
  quizzesCompleted: number;
}

// Friend Types
export interface Friend {
  _id: string;
  user: User;
  friend: User;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface FriendRequest {
  _id: string;
  from: User;
  to: User;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

// Challenge Types
export interface Challenge {
  _id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'friend' | 'quiz-battle';
  quiz?: Quiz;
  participants: User[];
  startDate: string;
  endDate: string;
  xpReward: number;
  status: 'active' | 'completed' | 'expired';
}

// Notification Types
export interface Notification {
  _id: string;
  user: string;
  type: 'badge' | 'level-up' | 'streak' | 'friend-request' | 'comment' | 'challenge';
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

// Comment Types
export interface Comment {
  _id: string;
  user: User;
  lesson: string;
  content: string;
  parentComment?: string;
  likes: number;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Forum Types
export interface ForumPost {
  _id: string;
  title: string;
  content: string;
  author: User;
  topic: string;
  tags: string[];
  views: number;
  upvotes: number;
  downvotes: number;
  commentsCount: number;
  isPinned: boolean;
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
}

// Certificate Types
export interface Certificate {
  _id: string;
  user: User;
  course: Course;
  certificateNumber: string;
  issueDate: string;
  verificationUrl: string;
  pdfUrl?: string;
}

// Analytics Types
export interface UserAnalytics {
  totalStudyTime: number;
  averageSessionTime: number;
  lessonsPerWeek: number;
  quizzesPerWeek: number;
  strongTopics: string[];
  weakTopics: string[];
  learningStreak: number;
  completionRate: number;
}

export interface LearningInsight {
  type: 'improvement' | 'streak' | 'milestone' | 'recommendation';
  message: string;
  category?: string;
  action?: string;
}

// Roadmap Types
export interface Roadmap {
  _id: string;
  user: string;
  goal: string;
  currentLevel: string;
  targetLevel: string;
  timeframe: number;
  milestones: Milestone[];
  progress: number;
  status: 'active' | 'completed' | 'abandoned';
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  _id: string;
  title: string;
  description: string;
  order: number;
  estimatedHours: number;
  difficulty: string;
  status: 'locked' | 'unlocked' | 'in-progress' | 'completed';
  topics: string[];
  resources: Resource[];
  assessments: string[];
}

export interface Resource {
  type: 'lesson' | 'video' | 'article' | 'book' | 'course';
  title: string;
  url?: string;
  duration?: number;
}

// TTS Types
export interface TTSAudio {
  _id: string;
  text: string;
  voice: string;
  audioUrl: string;
  duration: number;
  createdAt: string;
}

// ASR Types
export interface Transcription {
  _id: string;
  audioUrl: string;
  text: string;
  language: string;
  confidence: number;
  duration: number;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface FilterParams {
  topic?: string;
  difficulty?: string;
  search?: string;
  tags?: string[];
}

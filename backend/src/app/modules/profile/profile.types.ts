export interface IUpdateProfileRequest {
  name?: string;
  bio?: string;
  profilePicture?: string;
  phone?: string;
}

export interface IUpdatePreferencesRequest {
  interests?: string[];
  goals?: string[];
  dailyLearningTime?: number;
  preferredDifficulty?: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic';
}

export interface IUserProfileResponse {
  _id: string;
  email: string;
  name: string;
  role: string;
  profilePicture?: string;
  bio?: string;
  phone?: string;
  xp: number;
  coins: number;
  level: number;
  streak: {
    current: number;
    longest: number;
    lastActivityDate?: Date;
  };
  badges: string[];
  preferences: {
    interests: string[];
    goals: string[];
    dailyLearningTime: number;
    preferredDifficulty: string;
    language: string;
    learningStyle?: string;
  };
  isPremium: boolean;
  premiumExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPublicProfileResponse {
  _id: string;
  name: string;
  profilePicture?: string;
  bio?: string;
  level: number;
  xp: number;
  badges: any[];
  stats: {
    lessonsCompleted: number;
    quizzesCompleted: number;
    currentStreak: number;
    longestStreak: number;
    totalTimeSpent: number;
  };
  createdAt: Date;
}

export interface ILearningPreferences {
  interests: string[];
  goals: string[];
  dailyLearningTime: number; // in minutes
  preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic';
}

export interface IStreak {
  current: number;
  longest: number;
  lastActivityDate?: Date;
}

export interface IUser {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'learner' | 'instructor';
  isActive: boolean;
  profilePicture?: string;
  bio?: string;
  phone?: string;
  
  // Gamification
  xp: number;
  coins: number;
  level: number;
  streak: IStreak;
  badges: string[]; // Badge IDs
  
  // Learning Preferences
  preferences: ILearningPreferences;
  
  // Premium
  isPremium: boolean;
  premiumExpiresAt?: Date;
  
  // Seller Verification & Moderation
  isVerified?: boolean;
  isSuspended?: boolean;
  suspensionReason?: string;
  
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'learner';
}

export interface IAuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    xp?: number;
    level?: number;
    streak?: number;
  };
  accessToken: string;
  refreshToken: string;
}

export interface IRefreshTokenRequest {
  refreshToken: string;
}

export interface IJwtPayload {
  userId: string;
  email: string;
  role: string;
}

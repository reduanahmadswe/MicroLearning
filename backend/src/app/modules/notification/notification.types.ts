import mongoose from 'mongoose';

export interface INotification {
  user: mongoose.Types.ObjectId;
  type: 'badge_earned' | 'streak_milestone' | 'level_up' | 'quiz_completed' | 'lesson_recommendation' | 'friend_request' | 'comment_reply' | 'system_announcement';
  title: string;
  message: string;
  data?: {
    badgeId?: string;
    lessonId?: string;
    quizId?: string;
    userId?: string;
    commentId?: string;
    level?: number;
    streak?: number;
  };
  isRead: boolean;
  isPush: boolean; // For push notification
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateNotificationRequest {
  user: string;
  type: INotification['type'];
  title: string;
  message: string;
  data?: INotification['data'];
  isPush?: boolean;
}

export interface INotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  streakReminders: boolean;
  badgeNotifications: boolean;
  lessonRecommendations: boolean;
  communityActivity: boolean;
}

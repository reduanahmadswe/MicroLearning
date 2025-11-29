import { Types } from 'mongoose';

export interface IEmailTemplate {
  _id: Types.ObjectId;
  templateType: 'welcome' | 'reset-password' | 'challenge-complete' | 'daily-reminder' | 'achievement-unlocked' | 'course-complete' | 'weekly-summary' | 'custom';
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[]; // e.g., ['username', 'challengeName', 'xpEarned']
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEmailLog {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  templateType: IEmailTemplate['templateType'];
  recipient: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  provider: 'sendgrid' | 'smtp' | 'console';
  messageId?: string;
  errorMessage?: string;
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEmailPreference {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  preferences: {
    dailyReminder: boolean;
    challengeComplete: boolean;
    achievementUnlocked: boolean;
    courseComplete: boolean;
    weeklySummary: boolean;
    friendActivity: boolean;
    marketplaceUpdates: boolean;
    systemAnnouncements: boolean;
  };
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendEmailInput {
  userId: string;
  recipient: string;
  templateType: IEmailTemplate['templateType'];
  variables: Record<string, any>;
  scheduledAt?: Date;
}

export interface SendBulkEmailInput {
  recipients: { userId: string; email: string; variables?: Record<string, any> }[];
  templateType: IEmailTemplate['templateType'];
  globalVariables?: Record<string, any>;
}

export interface CreateEmailTemplateInput {
  templateType: IEmailTemplate['templateType'];
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

export interface UpdateEmailPreferencesInput {
  dailyReminder?: boolean;
  challengeComplete?: boolean;
  achievementUnlocked?: boolean;
  courseComplete?: boolean;
  weeklySummary?: boolean;
  friendActivity?: boolean;
  marketplaceUpdates?: boolean;
  systemAnnouncements?: boolean;
}

export interface GetEmailLogsQuery {
  userId?: string;
  status?: IEmailLog['status'];
  templateType?: IEmailTemplate['templateType'];
  limit?: number;
  skip?: number;
}

export interface EmailStats {
  totalSent: number;
  totalFailed: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
  byTemplate: {
    templateType: string;
    sent: number;
    opened: number;
    clicked: number;
  }[];
}

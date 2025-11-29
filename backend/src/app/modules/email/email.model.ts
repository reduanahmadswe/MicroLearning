import { Schema, model } from 'mongoose';
import { IEmailTemplate, IEmailLog, IEmailPreference } from './email.types';

const emailTemplateSchema = new Schema<IEmailTemplate>(
  {
    templateType: {
      type: String,
      enum: [
        'welcome',
        'reset-password',
        'challenge-complete',
        'daily-reminder',
        'achievement-unlocked',
        'course-complete',
        'weekly-summary',
        'custom',
      ],
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    htmlContent: {
      type: String,
      required: true,
    },
    textContent: {
      type: String,
      required: true,
    },
    variables: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const emailLogSchema = new Schema<IEmailLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    templateType: {
      type: String,
      enum: [
        'welcome',
        'reset-password',
        'challenge-complete',
        'daily-reminder',
        'achievement-unlocked',
        'course-complete',
        'weekly-summary',
        'custom',
      ],
      required: true,
    },
    recipient: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'bounced'],
      default: 'pending',
      index: true,
    },
    provider: {
      type: String,
      enum: ['sendgrid', 'smtp', 'console'],
      required: true,
    },
    messageId: {
      type: String,
    },
    errorMessage: {
      type: String,
    },
    sentAt: {
      type: Date,
    },
    openedAt: {
      type: Date,
    },
    clickedAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for analytics
emailLogSchema.index({ templateType: 1, status: 1 });
emailLogSchema.index({ sentAt: -1 });

const emailPreferenceSchema = new Schema<IEmailPreference>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    preferences: {
      dailyReminder: {
        type: Boolean,
        default: true,
      },
      challengeComplete: {
        type: Boolean,
        default: true,
      },
      achievementUnlocked: {
        type: Boolean,
        default: true,
      },
      courseComplete: {
        type: Boolean,
        default: true,
      },
      weeklySummary: {
        type: Boolean,
        default: true,
      },
      friendActivity: {
        type: Boolean,
        default: true,
      },
      marketplaceUpdates: {
        type: Boolean,
        default: false,
      },
      systemAnnouncements: {
        type: Boolean,
        default: true,
      },
    },
    unsubscribedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const EmailTemplate = model<IEmailTemplate>('EmailTemplate', emailTemplateSchema);
export const EmailLog = model<IEmailLog>('EmailLog', emailLogSchema);
export const EmailPreference = model<IEmailPreference>('EmailPreference', emailPreferenceSchema);

import { Schema, model } from 'mongoose';
import { IDeviceToken, IScheduledNotification } from './push.types';

// Device Token Schema
const deviceTokenSchema = new Schema<IDeviceToken>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      enum: ['ios', 'android', 'web'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
deviceTokenSchema.index({ user: 1 });
deviceTokenSchema.index({ token: 1 }, { unique: true });
deviceTokenSchema.index({ user: 1, platform: 1 });

// Scheduled Notification Schema
const scheduledNotificationSchema = new Schema<IScheduledNotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
    sentAt: {
      type: Date,
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
scheduledNotificationSchema.index({ user: 1, status: 1 });
scheduledNotificationSchema.index({ scheduledAt: 1, status: 1 });

export const DeviceToken = model<IDeviceToken>('DeviceToken', deviceTokenSchema);
export const ScheduledNotification = model<IScheduledNotification>(
  'ScheduledNotification',
  scheduledNotificationSchema
);

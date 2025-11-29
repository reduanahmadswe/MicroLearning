import mongoose, { Schema } from 'mongoose';
import { INotification } from './notification.types';

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'badge_earned',
        'streak_milestone',
        'level_up',
        'quiz_completed',
        'lesson_recommendation',
        'friend_request',
        'comment_reply',
        'system_announcement',
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    data: {
      badgeId: String,
      lessonId: String,
      quizId: String,
      userId: String,
      commentId: String,
      level: Number,
      streak: Number,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPush: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user notifications
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

export default mongoose.model<INotification>('Notification', notificationSchema);

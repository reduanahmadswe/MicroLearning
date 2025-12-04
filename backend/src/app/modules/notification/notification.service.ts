import Notification from './notification.model';
import User from '../auth/auth.model';
import ApiError from '../../../utils/ApiError';
import { ICreateNotificationRequest } from './notification.types';
import { io } from '../../../server';

class NotificationService {
  // Create notification
  async createNotification(data: ICreateNotificationRequest) {
    const notification = await Notification.create(data);

    // Send real-time notification via Socket.IO
    try {
      io.to(`user_${data.user}`).emit('notification', {
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      });
      console.log(`📬 Notification sent to user ${data.user}`);
    } catch (error) {
      console.error('Error sending real-time notification:', error);
    }

    return notification;
  }

  // Get user notifications
  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    isRead?: boolean
  ) {
    const query: any = { user: userId };

    if (typeof isRead !== 'undefined') {
      query.isRead = isRead;
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string) {
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId,
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    notification.isRead = true;
    await notification.save();

    return notification;
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string) {
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });

    return { message: 'All notifications marked as read' };
  }

  // Delete notification
  async deleteNotification(notificationId: string, userId: string) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId,
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    return { message: 'Notification deleted successfully' };
  }

  // Get unread count
  async getUnreadCount(userId: string) {
    const count = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });

    return { unreadCount: count };
  }

  // Send badge earned notification
  async notifyBadgeEarned(userId: string, badgeName: string, badgeId: string) {
    return this.createNotification({
      user: userId,
      type: 'badge_earned',
      title: '🏆 New Badge Earned!',
      message: `Congratulations! You've earned the "${badgeName}" badge!`,
      data: { badgeId },
      isPush: true,
    });
  }

  // Send level up notification
  async notifyLevelUp(userId: string, newLevel: number) {
    return this.createNotification({
      user: userId,
      type: 'level_up',
      title: '🎉 Level Up!',
      message: `Congratulations! You've reached Level ${newLevel}!`,
      data: { level: newLevel },
      isPush: true,
    });
  }

  // Send streak milestone notification
  async notifyStreakMilestone(userId: string, streakDays: number) {
    return this.createNotification({
      user: userId,
      type: 'streak_milestone',
      title: '🔥 Streak Milestone!',
      message: `Amazing! You've maintained a ${streakDays}-day learning streak!`,
      data: { streak: streakDays },
      isPush: true,
    });
  }

  // Send lesson recommendation
  async notifyLessonRecommendation(
    userId: string,
    lessonTitle: string,
    lessonId: string
  ) {
    return this.createNotification({
      user: userId,
      type: 'lesson_recommendation',
      title: '📚 New Lesson Recommendation',
      message: `Check out this lesson: "${lessonTitle}"`,
      data: { lessonId },
      isPush: false,
    });
  }

  // Send quiz completion notification
  async notifyQuizCompleted(
    userId: string,
    quizTitle: string,
    score: number,
    quizId: string
  ) {
    return this.createNotification({
      user: userId,
      type: 'quiz_completed',
      title: '✅ Quiz Completed',
      message: `You scored ${score}% on "${quizTitle}"!`,
      data: { quizId },
      isPush: false,
    });
  }

  // Cleanup old notifications (older than 30 days)
  async cleanupOldNotifications() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Notification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      isRead: true,
    });

    return {
      message: 'Old notifications cleaned up',
      deletedCount: result.deletedCount,
    };
  }
}

export default new NotificationService();

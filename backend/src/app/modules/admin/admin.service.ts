import User from '../auth/auth.model';
import Lesson from '../microLessons/lesson.model';
import { Quiz, QuizAttempt } from '../quiz/quiz.model';
import Flashcard from '../flashcard/flashcard.model';
import { Course, Enrollment } from '../course/course.model';
import UserProgress from '../progressTracking/progress.model';
import Certificate from '../certificate/certificate.model';
import ApiError from '../../../utils/ApiError';

class AdminService {
  // Get dashboard statistics
  async getDashboardStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      activeUsers,
      newUsers,
      roleDistribution,
      totalLessons,
      totalQuizzes,
      totalFlashcards, 
      totalCourses,
      totalLessonCompletions,
      totalQuizAttempts,
      totalCertificates,
      topUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ updatedAt: { $gte: thirtyDaysAgo }, isActive: true }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      Lesson.countDocuments(),
      Quiz.countDocuments(),
      Flashcard.countDocuments(),
      Course.countDocuments(),
      UserProgress.countDocuments(),
      QuizAttempt.countDocuments(),
      Certificate.countDocuments({ isRevoked: false }),
      User.find()
        .sort({ xp: -1 })
        .limit(10)
        .select('name email xp level')
        .lean(),
    ]);

    // Calculate average completion rate
    const enrollments = await Enrollment.find().select('progress').lean();
    const avgCompletionRate = enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length
      : 0;

    // Get lesson completion count per top user
    const topPerformers = await Promise.all(
      topUsers.map(async (user) => {
        const completedLessons = await UserProgress.countDocuments({
          user: user._id,
        });
        return {
          userId: user._id.toString(),
          name: user.name,
          email: user.email,
          xp: user.xp,
          level: user.level,
          completedLessons,
        };
      })
    );

    const roleMap = roleDistribution.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
        byRole: {
          learner: roleMap.learner || 0,
          instructor: roleMap.instructor || 0,
          admin: roleMap.admin || 0,
        },
      },
      content: {
        lessons: totalLessons,
        quizzes: totalQuizzes,
        flashcards: totalFlashcards,
        courses: totalCourses,
      },
      engagement: {
        totalLessonCompletions,
        totalQuizAttempts,
        totalCertificates,
        averageCompletionRate: Math.round(avgCompletionRate * 100) / 100,
      },
      topPerformers,
    };
  }

  // Get all users with filters
  async getUsers(filters: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { role, search, page = 1, limit = 100 } = filters;

    const query: any = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    
    // Cap the limit at 1000 to prevent performance issues
    const effectiveLimit = Math.min(limit, 1000);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(effectiveLimit)
        .lean(),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: {
        page,
        limit: effectiveLimit,
        total,
        totalPages: Math.ceil(total / effectiveLimit),
      },
    };
  }

  // Ban/Unban user
  async banUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.role === 'admin') {
      throw new ApiError(403, 'Cannot ban admin users');
    }

    user.isActive = false;
    await user.save();

    return { message: 'User banned successfully' };
  }

  async unbanUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.isActive = true;
    await user.save();

    return { message: 'User unbanned successfully' };
  }

  // Promote/Demote user
  async promoteToInstructor(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.role === 'admin' || user.role === 'instructor') {
      throw new ApiError(400, 'User is already instructor or admin');
    }

    user.role = 'instructor';
    await user.save();

    return { message: 'User promoted to instructor successfully' };
  }

  async demoteToLearner(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.role === 'admin') {
      throw new ApiError(403, 'Cannot demote admin users');
    }

    user.role = 'learner';
    await user.save();

    return { message: 'User demoted to learner successfully' };
  }

  // Delete user
  async deleteUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.role === 'admin') {
      throw new ApiError(403, 'Cannot delete admin users');
    }

    // Delete all user-related data
    await Promise.all([
      UserProgress.deleteMany({ user: userId }),
      QuizAttempt.deleteMany({ user: userId }),
      Enrollment.deleteMany({ user: userId }),
      Certificate.deleteMany({ user: userId }),
      User.findByIdAndDelete(userId),
    ]);

    return { message: 'User and all related data deleted successfully' };
  }

  // Get content statistics
  async getContentStats() {
    const [lessons, quizzes, flashcards, courses] = await Promise.all([
      Lesson.find()
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Quiz.find()
        .populate('lesson', 'title')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Flashcard.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Course.find()
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    return {
      recentLessons: lessons,
      recentQuizzes: quizzes,
      recentFlashcards: flashcards,
      recentCourses: courses,
    };
  }

  // Get system statistics
  async getSystemStats() {
    const [totalUsers, activeUsers, totalRevenue, apiCalls] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ 'streak.lastActivityDate': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      this.getTotalRevenue(),
      this.getAPICallsCount(),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      totalRevenue,
      apiCalls,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }

  // Get performance metrics
  async getPerformanceMetrics() {
    return {
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
    };
  }

  // Get error logs
  async getErrorLogs(options: { page: number; limit: number }) {
    // In production, this would fetch from error logging service (e.g., Sentry, LogRocket)
    // For now, return mock data
    return {
      logs: [],
      pagination: {
        currentPage: options.page,
        totalPages: 0,
        totalItems: 0,
      },
      message: 'Error logging service not configured',
    };
  }

  // Get database health
  async getDatabaseHealth() {
    const mongoose = await import('mongoose');
    const db = mongoose.connection.db;

    if (!db) {
      return { status: 'disconnected', collections: 0 };
    }

    const collections = await db.listCollections().toArray();
    const stats = await db.stats();

    return {
      status: 'connected',
      collections: collections.length,
      dataSize: stats.dataSize,
      indexSize: stats.indexSize,
      storageSize: stats.storageSize,
    };
  }

  // Get comments for moderation
  async getCommentsForModeration(options: { status?: string; page: number; limit: number }) {
    const Comment = (await import('../comment/comment.model')).default;
    const { status, page, limit } = options;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status === 'flagged') query.isFlagged = true;
    if (status === 'pending') query.isApproved = false;

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .populate('user', 'name email profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Comment.countDocuments(query),
    ]);

    return {
      comments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    };
  }

  // Moderate comment
  async moderateComment(commentId: string, action: string, reason?: string) {
    const Comment = (await import('../comment/comment.model')).default;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }

    if (action === 'approve') {
      comment.isApproved = true;
      comment.isFlagged = false;
    } else if (action === 'reject' || action === 'delete') {
      comment.isApproved = false;
      comment.moderationReason = reason;
    }

    await comment.save();
    return comment;
  }

  // Get flagged content
  async getFlaggedContent(options: { page: number; limit: number }) {
    const Comment = (await import('../comment/comment.model')).default;
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ isFlagged: true })
        .populate('user', 'name email profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Comment.countDocuments({ isFlagged: true }),
    ]);

    return {
      flaggedComments: comments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    };
  }

  // Remove spam content
  async removeSpamContent(contentId: string, contentType: string) {
    if (contentType === 'comment') {
      const Comment = (await import('../comment/comment.model')).default;
      await Comment.findByIdAndDelete(contentId);
    } else if (contentType === 'post') {
      const Post = (await import('../forum/forum.model')).Post;
      await Post.findByIdAndDelete(contentId);
    }

    return { message: 'Spam content removed successfully' };
  }

  // Helper: Get total revenue
  private async getTotalRevenue() {
    // Marketplace removed - return 0
    return 0;
  }

  // Helper: Get API calls count (mock for now)
  private async getAPICallsCount() {
    // In production, integrate with API monitoring service
    return Math.floor(Math.random() * 100000);
  }
}

export default new AdminService();

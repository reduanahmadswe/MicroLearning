import User from '../auth/auth.model';
import UserProgress from '../progressTracking/progress.model';
import { QuizAttempt } from '../quiz/quiz.model';
import Certificate from '../certificate/certificate.model';
import { Enrollment } from '../course/course.model';

import ApiError from '../../../utils/ApiError';
import { Badge } from '../badge/badge.model';

class AnalyticsService {
  // Get user analytics
  async getUserAnalytics(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Learning streak
    const currentStreak = user.streak?.current || 0;
    const longestStreak = user.streak?.longest || 0;
    const lastActivityDate = user.streak?.lastActivityDate || user.createdAt;

    // Progress over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const progressData = await UserProgress.aggregate([
      {
        $match: {
          user: user._id,
          completedAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' },
          },
          lessonsCompleted: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const progressOverTime = progressData.map((item: any) => ({
      date: item._id,
      xp: 50, // Approximate XP per lesson
      lessonsCompleted: item.lessonsCompleted,
    }));

    // Category breakdown
    const categoryData = await UserProgress.aggregate([
      { $match: { user: user._id } },
      {
        $lookup: {
          from: 'lessons',
          localField: 'lesson',
          foreignField: '_id',
          as: 'lessonData',
        },
      },
      { $unwind: '$lessonData' },
      {
        $group: {
          _id: '$lessonData.category',
          lessonsCompleted: { $sum: 1 },
          timeSpent: { $sum: '$lessonData.estimatedTime' },
        },
      },
    ]);

    const categoryBreakdown = categoryData.map((item: any) => ({
      category: item._id,
      lessonsCompleted: item.lessonsCompleted,
      timeSpent: item.timeSpent,
    }));

    // Performance metrics
    const [quizStats, _totalProgress, coursesCompleted] = await Promise.all([
      QuizAttempt.aggregate([
        { $match: { user: user._id } },
        {
          $group: {
            _id: null,
            averageScore: { $avg: '$score' },
            totalQuizzes: { $sum: 1 },
          },
        },
      ]),
      UserProgress.countDocuments({ user: userId }),
      Enrollment.countDocuments({
        user: userId,
        isCompleted: true,
      }),
    ]);

    const averageQuizScore = quizStats[0]?.averageScore || 0;
    const totalQuizzes = quizStats[0]?.totalQuizzes || 0;

    // Calculate completion rate
    const enrolledCourses = await Enrollment.countDocuments({ user: userId });
    const completionRate = enrolledCourses > 0 
      ? (coursesCompleted / enrolledCourses) * 100 
      : 0;

    // Study time (estimate based on lessons)
    const studyTimeData = await UserProgress.aggregate([
      { $match: { user: user._id } },
      {
        $lookup: {
          from: 'lessons',
          localField: 'lesson',
          foreignField: '_id',
          as: 'lessonData',
        },
      },
      { $unwind: '$lessonData' },
      {
        $group: {
          _id: null,
          totalTime: { $sum: '$lessonData.estimatedTime' },
        },
      },
    ]);

    const studyTimeTotal = studyTimeData[0]?.totalTime || 0;

    // Achievements
    const [badges, certificates] = await Promise.all([
      Badge.countDocuments({ user: userId }),
      Certificate.countDocuments({ user: userId, isRevoked: false }),
    ]);

    return {
      learningStreak: {
        current: currentStreak,
        longest: longestStreak,
        lastActivityDate,
      },
      progressOverTime,
      categoryBreakdown,
      performanceMetrics: {
        averageQuizScore: Math.round(averageQuizScore * 100) / 100,
        totalQuizzes,
        completionRate: Math.round(completionRate * 100) / 100,
        studyTimeTotal,
      },
      achievements: {
        badges,
        certificates,
        coursesCompleted,
      },
    };
  }

  // Get system analytics (admin only)
  async getSystemAnalytics() {
    // User growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userGrowthData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          newUsers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Calculate cumulative total
    let cumulativeTotal = await User.countDocuments({
      createdAt: { $lt: thirtyDaysAgo },
    });

    const userGrowth = userGrowthData.map((item) => {
      cumulativeTotal += item.newUsers;
      return {
        date: item._id,
        newUsers: item.newUsers,
        totalUsers: cumulativeTotal,
      };
    });

    // Engagement metrics
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgoDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [dailyActiveUsers, weeklyActiveUsers, monthlyActiveUsers] = await Promise.all([
      User.countDocuments({ lastLoginAt: { $gte: oneDayAgo } }),
      User.countDocuments({ lastLoginAt: { $gte: sevenDaysAgo } }),
      User.countDocuments({ lastLoginAt: { $gte: thirtyDaysAgoDate } }),
    ]);

    // Most popular lessons
    const popularLessons = await UserProgress.aggregate([
      {
        $group: {
          _id: '$lesson',
          completions: { $sum: 1 },
        },
      },
      { $sort: { completions: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'lessons',
          localField: '_id',
          foreignField: '_id',
          as: 'lessonData',
        },
      },
      { $unwind: '$lessonData' },
      {
        $project: {
          lessonId: '$_id',
          title: '$lessonData.title',
          completions: 1,
        },
      },
    ]);

    // Most popular courses
    const popularCourses = await Enrollment.aggregate([
      {
        $group: {
          _id: '$course',
          enrollments: { $sum: 1 },
        },
      },
      { $sort: { enrollments: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'courseData',
        },
      },
      { $unwind: '$courseData' },
      {
        $project: {
          courseId: '$_id',
          title: '$courseData.title',
          enrollments: 1,
        },
      },
    ]);

    // Performance metrics
    const totalEnrollments = await Enrollment.countDocuments();
    const completedEnrollments = await Enrollment.countDocuments({ isCompleted: true });
    const dropOffRate = totalEnrollments > 0 
      ? ((totalEnrollments - completedEnrollments) / totalEnrollments) * 100 
      : 0;

    const totalUsers = await User.countDocuments();
    const retentionRate = totalUsers > 0 
      ? (monthlyActiveUsers / totalUsers) * 100 
      : 0;

    return {
      userGrowth,
      engagementMetrics: {
        dailyActiveUsers,
        weeklyActiveUsers,
        monthlyActiveUsers,
        averageSessionDuration: 15, // Placeholder - would need session tracking
      },
      contentMetrics: {
        mostPopularLessons: popularLessons,
        mostPopularCourses: popularCourses,
      },
      performanceMetrics: {
        averageCompletionTime: 30, // Placeholder - would need time tracking
        dropOffRate: Math.round(dropOffRate * 100) / 100,
        retentionRate: Math.round(retentionRate * 100) / 100,
      },
    };
  }

  // Get learning insights for user
  async getLearningInsights(userId: string) {
    const [user, recentProgress, strongCategories, weakCategories] = await Promise.all([
      User.findById(userId),
      UserProgress.find({ user: userId })
        .sort({ completedAt: -1 })
        .limit(5)
        .populate('lesson', 'title category'),
      // Strong categories (high completion)
      UserProgress.aggregate([
        { $match: { user: userId } },
        {
          $lookup: {
            from: 'lessons',
            localField: 'lesson',
            foreignField: '_id',
            as: 'lessonData',
          },
        },
        { $unwind: '$lessonData' },
        {
          $group: {
            _id: '$lessonData.category',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 3 },
      ]),
      // Weak categories (low quiz scores)
      QuizAttempt.aggregate([
        { $match: { user: userId } },
        {
          $lookup: {
            from: 'quizzes',
            localField: 'quiz',
            foreignField: '_id',
            as: 'quizData',
          },
        },
        { $unwind: '$quizData' },
        {
          $lookup: {
            from: 'lessons',
            localField: 'quizData.lesson',
            foreignField: '_id',
            as: 'lessonData',
          },
        },
        { $unwind: '$lessonData' },
        {
          $group: {
            _id: '$lessonData.category',
            averageScore: { $avg: '$score' },
          },
        },
        { $sort: { averageScore: 1 } },
        { $limit: 3 },
      ]),
    ]);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Generate recommendations
    const recommendations = [];
    
    if (weakCategories.length > 0) {
      recommendations.push({
        type: 'improvement',
        message: `Focus on ${weakCategories[0]._id} - your quiz scores can be improved here`,
        category: weakCategories[0]._id,
      });
    }

    if ((user.streak?.current || 0) < 7) {
      recommendations.push({
        type: 'streak',
        message: 'Build your learning streak! Study daily to unlock streak badges',
      });
    }

    return {
      recentActivity: recentProgress,
      strongCategories: strongCategories.map((c: any) => c._id),
      weakCategories: weakCategories.map((c: any) => c._id),
      recommendations,
      nextMilestone: {
        type: 'level',
        current: user.level,
        next: user.level + 1,
        xpNeeded: (user.level + 1) * 100 - user.xp,
      },
    };
  }

  // Admin: Get revenue analytics
  async getRevenueAnalytics(startDate?: string, endDate?: string) {
    const Purchase = (await import('../marketplace/marketplace.model')).Purchase;
    
    const dateFilter: any = { paymentStatus: 'completed' };
    if (startDate) dateFilter.purchasedAt = { $gte: new Date(startDate) };
    if (endDate) dateFilter.purchasedAt = { ...dateFilter.purchasedAt, $lte: new Date(endDate) };

    const [totalRevenue, dailyRevenue, topSellingItems] = await Promise.all([
      Purchase.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Purchase.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$purchasedAt' } },
            revenue: { $sum: '$amount' },
            sales: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Purchase.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$item', revenue: { $sum: '$amount' }, sales: { $sum: 1 } } },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalSales: totalRevenue[0]?.count || 0,
      dailyRevenue,
      topSellingItems,
    };
  }

  // Admin: Get engagement report
  async getEngagementReport(timeframe: string = '7d') {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [activeUsers, lessonsCompleted, quizzesAttempted] = await Promise.all([
      User.countDocuments({ 'streak.lastActivityDate': { $gte: startDate } }),
      UserProgress.countDocuments({ completedAt: { $gte: startDate }, status: 'completed' }),
      QuizAttempt.countDocuments({ submittedAt: { $gte: startDate } }),
    ]);

    return {
      timeframe,
      activeUsers,
      lessonsCompleted,
      quizzesAttempted,
      avgLessonsPerUser: activeUsers > 0 ? Math.round(lessonsCompleted / activeUsers) : 0,
    };
  }

  // Admin: Get popular content
  async getPopularContent(limit: number = 10) {
    const [popularLessons, popularQuizzes] = await Promise.all([
      UserProgress.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: '$lesson', completions: { $sum: 1 } } },
        { $sort: { completions: -1 } },
        { $limit: limit },
        { $lookup: { from: 'lessons', localField: '_id', foreignField: '_id', as: 'lesson' } },
        { $unwind: '$lesson' },
      ]),
      QuizAttempt.aggregate([
        { $group: { _id: '$quiz', attempts: { $sum: 1 }, avgScore: { $avg: '$score' } } },
        { $sort: { attempts: -1 } },
        { $limit: limit },
        { $lookup: { from: 'quizzes', localField: '_id', foreignField: '_id', as: 'quiz' } },
        { $unwind: '$quiz' },
      ]),
    ]);

    return { popularLessons, popularQuizzes };
  }

  // Admin: Get learning trends
  async getLearningTrends(period: string = '30d') {
    const days = period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await UserProgress.aggregate([
      { $match: { completedAt: { $gte: startDate }, status: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          completions: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', completions: 1, uniqueUsers: { $size: '$uniqueUsers' } } },
    ]);

    return trends;
  }

  // Admin: Get user growth
  async getUserGrowth(period: string = '30d') {
    const days = period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const growth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          newUsers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalUsers = await User.countDocuments({});
    const premiumUsers = await User.countDocuments({ isPremium: true });

    return {
      growth,
      totalUsers,
      premiumUsers,
      conversionRate: totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0,
    };
  }
}

export default new AnalyticsService();

import User from '../auth/auth.model';
import UserProgress from '../userProgress/userProgress.model';
import QuizAttempt from '../quizAttempt/quizAttempt.model';
import Certificate from '../certificate/certificate.model';
import { Enrollment } from '../course/course.model';
import Badge from '../badges/badges.model';
import Lesson from '../microLessons/microLesson.model';
import ApiError from '../../../utils/ApiError';

class AnalyticsService {
  // Get user analytics
  async getUserAnalytics(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Learning streak
    const currentStreak = user.currentStreak || 0;
    const longestStreak = user.longestStreak || 0;
    const lastActivityDate = user.lastLoginAt || user.createdAt;

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

    const progressOverTime = progressData.map((item) => ({
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

    const categoryBreakdown = categoryData.map((item) => ({
      category: item._id,
      lessonsCompleted: item.lessonsCompleted,
      timeSpent: item.timeSpent,
    }));

    // Performance metrics
    const [quizStats, totalProgress, coursesCompleted] = await Promise.all([
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

    if (user.currentStreak < 7) {
      recommendations.push({
        type: 'streak',
        message: 'Build your learning streak! Study daily to unlock streak badges',
      });
    }

    return {
      recentActivity: recentProgress,
      strongCategories: strongCategories.map(c => c._id),
      weakCategories: weakCategories.map(c => c._id),
      recommendations,
      nextMilestone: {
        type: 'level',
        current: user.level,
        next: user.level + 1,
        xpNeeded: (user.level + 1) * 100 - user.xp,
      },
    };
  }
}

export default new AnalyticsService();

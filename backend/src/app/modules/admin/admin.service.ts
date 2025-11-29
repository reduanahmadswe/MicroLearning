import User from '../auth/auth.model';
import Lesson from '../microLessons/microLesson.model';
import Quiz from '../quiz/quiz.model';
import Flashcard from '../flashcard/flashcard.model';
import { Course, Enrollment } from '../course/course.model';
import UserProgress from '../userProgress/userProgress.model';
import QuizAttempt from '../quizAttempt/quizAttempt.model';
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
      User.countDocuments({ lastLoginAt: { $gte: thirtyDaysAgo } }),
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
          student: roleMap.student || 0,
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
    const { role, search, page = 1, limit = 20 } = filters;

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

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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

    user.isBlocked = true;
    await user.save();

    return { message: 'User banned successfully' };
  }

  async unbanUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.isBlocked = false;
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

  async demoteToStudent(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.role === 'admin') {
      throw new ApiError(403, 'Cannot demote admin users');
    }

    user.role = 'student';
    await user.save();

    return { message: 'User demoted to student successfully' };
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
}

export default new AdminService();

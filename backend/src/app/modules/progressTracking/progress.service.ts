import ApiError from '../../../utils/ApiError';
import UserProgress from './progress.model';
import User from '../auth/auth.model';
import { IUpdateProgressRequest, IProgressStats } from './progress.types';

class ProgressService {
  // Update or create progress
  async updateProgress(userId: string, progressData: IUpdateProgressRequest) {
    const { lessonId, progress, timeSpent, status, score, mastery } = progressData;

    // Find existing progress or create new
    let userProgress = await UserProgress.findOne({
      user: userId,
      lesson: lessonId,
    });

    if (!userProgress) {
      userProgress = await UserProgress.create({
        user: userId,
        lesson: lessonId,
        progress,
        timeSpent,
        status: status || (progress === 100 ? 'completed' : 'in-progress'),
        score,
        mastery: mastery || 0,
        attempts: 1,
        lastAccessed: new Date(),
      });
    } else {
      // Update existing progress
      userProgress.progress = Math.max(userProgress.progress, progress);
      userProgress.timeSpent += timeSpent;
      userProgress.lastAccessed = new Date();
      userProgress.attempts += 1;

      if (status) {
        userProgress.status = status;
      } else if (progress === 100 && userProgress.status !== 'completed') {
        userProgress.status = 'completed';
      }

      if (score !== undefined) {
        userProgress.score = Math.max(userProgress.score || 0, score);
      }

      if (mastery !== undefined) {
        userProgress.mastery = Math.max(userProgress.mastery, mastery);
      }

      await userProgress.save();
    }

    // Award XP if lesson completed
    if (userProgress.status === 'completed' && userProgress.isModified('status')) {
      await this.awardXP(userId, 50); // 50 XP for completing a lesson
      await this.updateStreak(userId);
    }

    return userProgress;
  }

  // Get user progress for a specific lesson
  async getLessonProgress(userId: string, lessonId: string) {
    const progress = await UserProgress.findOne({
      user: userId,
      lesson: lessonId,
    }).populate('lesson', 'title topic estimatedTime');

    return progress;
  }

  // Get all progress for a user
  async getUserProgress(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [progressList, total] = await Promise.all([
      UserProgress.find({ user: userId })
        .populate('lesson', 'title topic estimatedTime thumbnailUrl difficulty')
        .sort({ lastAccessed: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserProgress.countDocuments({ user: userId }),
    ]);

    return {
      progressList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get user statistics
  async getUserStats(userId: string): Promise<IProgressStats> {
    const [progressData, user] = await Promise.all([
      UserProgress.aggregate([
        { $match: { user: userId as any } },
        {
          $group: {
            _id: null,
            totalLessonsStarted: { $sum: 1 },
            totalLessonsCompleted: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            totalTimeSpent: { $sum: '$timeSpent' },
            averageMastery: { $avg: '$mastery' },
          },
        },
      ]),
      User.findById(userId),
    ]);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const stats = progressData[0] || {
      totalLessonsStarted: 0,
      totalLessonsCompleted: 0,
      totalTimeSpent: 0,
      averageMastery: 0,
    };

    return {
      totalLessonsStarted: stats.totalLessonsStarted,
      totalLessonsCompleted: stats.totalLessonsCompleted,
      totalTimeSpent: Math.round(stats.totalTimeSpent / 60), // Convert to minutes
      averageMastery: Math.round(stats.averageMastery || 0),
      currentStreak: user.streak.current,
      longestStreak: user.streak.longest,
      xpEarned: user.xp,
      level: user.level,
    };
  }

  // Get learning timeline/activity
  async getLearningTimeline(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const timeline = await UserProgress.find({
      user: userId,
      lastAccessed: { $gte: startDate },
    })
      .populate('lesson', 'title topic')
      .sort({ lastAccessed: -1 })
      .lean();

    return timeline;
  }

  // Award XP to user
  private async awardXP(userId: string, xp: number) {
    const user = await User.findById(userId);
    if (!user) return;

    user.xp += xp;
    
    // Calculate level (100 XP per level)
    const newLevel = Math.floor(user.xp / 100) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
      // TODO: Trigger level-up notification/reward
    }

    await user.save();
  }

  // Update streak
  private async updateStreak(userId: string) {
    const user = await User.findById(userId);
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivity = user.streak.lastActivityDate
      ? new Date(user.streak.lastActivityDate)
      : null;

    if (lastActivity) {
      lastActivity.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor(
        (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 0) {
        // Same day, no change
        return;
      } else if (daysDiff === 1) {
        // Consecutive day
        user.streak.current += 1;
        if (user.streak.current > user.streak.longest) {
          user.streak.longest = user.streak.current;
        }
      } else {
        // Streak broken
        user.streak.current = 1;
      }
    } else {
      // First activity
      user.streak.current = 1;
      user.streak.longest = 1;
    }

    user.streak.lastActivityDate = today;
    await user.save();
  }
}

export default new ProgressService();

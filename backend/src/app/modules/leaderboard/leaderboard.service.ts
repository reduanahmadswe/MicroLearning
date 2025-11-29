import User from '../auth/auth.model';
import UserProgress from '../progressTracking/progress.model';
import Lesson from '../microLessons/lesson.model';
import { ILeaderboardQuery, ILeaderboardEntry } from './leaderboard.types';
import ApiError from '../../../utils/ApiError';

class LeaderboardService {
  // Get global leaderboard
  async getGlobalLeaderboard(timeframe: string = 'all-time', limit: number = 50) {
    // For now, return all-time leaderboard
    // In production, implement Redis caching for performance
    
    const users = await User.find({ isActive: true, role: { $in: ['learner', 'instructor'] } })
      .select('name profilePicture xp level streak.current')
      .sort({ xp: -1 })
      .limit(limit)
      .lean();

    // Get lessons completed count for each user
    const leaderboard: ILeaderboardEntry[] = await Promise.all(
      users.map(async (user, index) => {
        const lessonsCompleted = await UserProgress.countDocuments({
          user: user._id,
          status: 'completed',
        });

        return {
          userId: user._id.toString(),
          name: user.name,
          profilePicture: user.profilePicture,
          xp: user.xp,
          level: user.level,
          streak: user.streak?.current || 0,
          lessonsCompleted,
          rank: index + 1,
        };
      })
    );

    return leaderboard;
  }

  // Get topic-based leaderboard
  async getTopicLeaderboard(topic: string, limit: number = 50) {
    // Get lessons in this topic
    const lessons = await Lesson.find({ topic: new RegExp(topic, 'i') }).select('_id');
    const lessonIds = lessons.map((l) => l._id);

    if (lessonIds.length === 0) {
      return [];
    }

    // Aggregate users by completed lessons in this topic
    const topicProgress = await UserProgress.aggregate([
      {
        $match: {
          lesson: { $in: lessonIds },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: '$user',
          lessonsCompleted: { $sum: 1 },
          totalMastery: { $avg: '$mastery' },
        },
      },
      { $sort: { lessonsCompleted: -1, totalMastery: -1 } },
      { $limit: limit },
    ]);

    // Populate user data
    const leaderboard: ILeaderboardEntry[] = await Promise.all(
      topicProgress.map(async (entry, index) => {
        const user = await User.findById(entry._id)
          .select('name profilePicture xp level streak.current')
          .lean();

        if (!user) {
          return null;
        }

        return {
          userId: user._id.toString(),
          name: user.name,
          profilePicture: user.profilePicture,
          xp: user.xp,
          level: user.level,
          streak: user.streak?.current || 0,
          lessonsCompleted: entry.lessonsCompleted,
          rank: index + 1,
        };
      })
    );

    return leaderboard.filter((entry) => entry !== null) as ILeaderboardEntry[];
  }

  // Get user's rank
  async getUserRank(userId: string, type: 'global' | 'topic' = 'global', topic?: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (type === 'global') {
      // Count users with higher XP
      const higherRankedCount = await User.countDocuments({
        isActive: true,
        xp: { $gt: user.xp },
      });

      return {
        rank: higherRankedCount + 1,
        xp: user.xp,
        level: user.level,
      };
    } else if (type === 'topic' && topic) {
      // Get user's lessons completed in topic
      const lessons = await Lesson.find({ topic: new RegExp(topic, 'i') }).select('_id');
      const lessonIds = lessons.map((l) => l._id);

      const userLessonsCompleted = await UserProgress.countDocuments({
        user: userId,
        lesson: { $in: lessonIds },
        status: 'completed',
      });

      // Count users with more completed lessons in this topic
      const higherRanked = await UserProgress.aggregate([
        {
          $match: {
            lesson: { $in: lessonIds },
            status: 'completed',
          },
        },
        {
          $group: {
            _id: '$user',
            count: { $sum: 1 },
          },
        },
        {
          $match: {
            count: { $gt: userLessonsCompleted },
          },
        },
      ]);

      return {
        rank: higherRanked.length + 1,
        lessonsCompleted: userLessonsCompleted,
        topic,
      };
    }

    throw new ApiError(400, 'Invalid leaderboard type or missing topic');
  }

  // Get user's position in leaderboard (with context)
  async getUserPositionInLeaderboard(userId: string, type: 'global' | 'topic', topic?: string) {
    const rank = await this.getUserRank(userId, type, topic);
    
    // Get leaderboard with user and surrounding players
    let leaderboard: ILeaderboardEntry[];
    
    if (type === 'global') {
      leaderboard = await this.getGlobalLeaderboard('all-time', 100);
    } else {
      leaderboard = await this.getTopicLeaderboard(topic!, 100);
    }

    // Find user in leaderboard
    const userIndex = leaderboard.findIndex((entry) => entry.userId === userId);
    
    // Get surrounding players (5 above, user, 5 below)
    const start = Math.max(0, userIndex - 5);
    const end = Math.min(leaderboard.length, userIndex + 6);
    const surroundingPlayers = leaderboard.slice(start, end);

    return {
      userRank: rank,
      surroundingPlayers,
      totalPlayers: leaderboard.length,
    };
  }
}

export default new LeaderboardService();

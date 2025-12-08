import ApiError from '../../../utils/ApiError';
import { Badge, UserAchievement } from './badge.model';
import User from '../auth/auth.model';
import UserProgress from '../progressTracking/progress.model';
import { QuizAttempt } from '../quiz/quiz.model';
import Flashcard from '../flashcard/flashcard.model';
import Notification from '../notification/notification.model';

class BadgeService {
  // Create badge (admin only)
  async createBadge(badgeData: any) {
    const badge = await Badge.create(badgeData);
    return badge;
  }

  // Get all badges
  async getAllBadges() {
    // Use lean() to bypass validation on existing data with invalid enums
    const badges = await Badge.find({ isActive: true })
      .sort({ rarity: -1, createdAt: -1 })
      .lean();
    return badges;
  }

  // Get badge by ID
  async getBadgeById(badgeId: string) {
    const badge = await Badge.findById(badgeId);
    if (!badge) {
      throw new ApiError(404, 'Badge not found');
    }
    return badge;
  }

  // Get user's achievements
  async getUserAchievements(userId: string) {
    const achievements = await UserAchievement.find({ user: userId })
      .populate('badge')
      .sort({ isCompleted: -1, earnedAt: -1 });

    return achievements;
  }

  // Get user's earned badges
  async getEarnedBadges(userId: string) {
    const achievements = await UserAchievement.find({
      user: userId,
      isCompleted: true,
    })
      .populate('badge')
      .sort({ earnedAt: -1 });

    return achievements;
  }

  // Check and award badges for user
  async checkAndAwardBadges(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const badges = await Badge.find({ isActive: true });
    const newlyEarnedBadges = [];

    for (const badge of badges) {
      // Check if user already has this achievement
      let achievement = await UserAchievement.findOne({
        user: userId,
        badge: badge._id,
      });

      // Create achievement if doesn't exist
      if (!achievement) {
        achievement = await UserAchievement.create({
          user: userId,
          badge: badge._id,
          progress: 0,
          isCompleted: false,
        });
      }

      // Skip if already completed
      if (achievement.isCompleted) continue;

      // Check criteria
      const progress = await this.calculateProgress(userId, badge.criteria);
      achievement.progress = progress;

      // Check if threshold met
      if (progress >= badge.criteria.threshold) {
        achievement.isCompleted = true;
        achievement.earnedAt = new Date();
        
        // Award XP
        user.xp += badge.xpReward;
        user.level = Math.floor(user.xp / 100) + 1;
        
        // Add badge to user's badges array
        if (!user.badges.includes(badge._id as any)) {
          user.badges.push(badge._id as any);
        }

        newlyEarnedBadges.push(badge);
      }

      await achievement.save();
    }

    await user.save();

    return newlyEarnedBadges;
  }

  // Calculate progress for badge criteria
  private async calculateProgress(userId: string, criteria: any): Promise<number> {
    const { type, threshold, topic } = criteria;

    switch (type) {
      case 'streak':
        const user = await User.findById(userId);
        return user?.streak.current || 0;

      case 'lessons_completed':
        if (topic) {
          // Count lessons completed for specific topic
          const count = await UserProgress.countDocuments({
            user: userId,
            status: 'completed',
          });
          // Note: We'd need to join with Lesson model to filter by topic
          // For simplicity, returning total count
          return count;
        }
        return await UserProgress.countDocuments({
          user: userId,
          status: 'completed',
        });

      case 'quiz_perfect':
        return await QuizAttempt.countDocuments({
          user: userId,
          score: 100,
        });

      case 'xp_milestone':
        const userXP = await User.findById(userId);
        return userXP?.xp || 0;

      case 'flashcard_mastered':
        return await Flashcard.countDocuments({
          user: userId,
          repetitions: { $gte: 5 },
          easeFactor: { $gte: 2.5 },
        });

      case 'topic_mastered':
        // Complex query - count completed lessons + perfect quizzes in topic
        // Simplified for now
        return 0;

      default:
        return 0;
    }
  }

  // Get achievement statistics
  async getAchievementStats(userId: string) {
    const [total, earned, inProgress] = await Promise.all([
      Badge.countDocuments({ isActive: true }),
      UserAchievement.countDocuments({
        user: userId,
        isCompleted: true,
      }),
      UserAchievement.countDocuments({
        user: userId,
        isCompleted: false,
        progress: { $gt: 0 },
      }),
    ]);

    const percentage = total > 0 ? Math.round((earned / total) * 100) : 0;

    return {
      totalBadges: total,
      earnedBadges: earned,
      inProgressBadges: inProgress,
      completionPercentage: percentage,
    };
  }

  // Initialize default badges
  async initializeDefaultBadges() {
    const defaultBadges = [
      // Streak badges
      {
        name: 'Week Warrior',
        description: 'Maintain a 7-day learning streak',
        icon: '🔥',
        criteria: { type: 'streak', threshold: 7 },
        rarity: 'common',
        xpReward: 50,
      },
      {
        name: 'Month Master',
        description: 'Maintain a 30-day learning streak',
        icon: '🏆',
        criteria: { type: 'streak', threshold: 30 },
        rarity: 'rare',
        xpReward: 200,
      },
      {
        name: 'Century Scholar',
        description: 'Maintain a 100-day learning streak',
        icon: '👑',
        criteria: { type: 'streak', threshold: 100 },
        rarity: 'legendary',
        xpReward: 1000,
      },
      
      // Lesson completion badges
      {
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: '👣',
        criteria: { type: 'lessons_completed', threshold: 1 },
        rarity: 'common',
        xpReward: 10,
      },
      {
        name: 'Knowledge Seeker',
        description: 'Complete 50 lessons',
        icon: '📚',
        criteria: { type: 'lessons_completed', threshold: 50 },
        rarity: 'rare',
        xpReward: 100,
      },
      {
        name: 'Learning Legend',
        description: 'Complete 200 lessons',
        icon: '⭐',
        criteria: { type: 'lessons_completed', threshold: 200 },
        rarity: 'epic',
        xpReward: 500,
      },
      
      // Quiz badges
      {
        name: 'Quiz Novice',
        description: 'Score 100% on your first quiz',
        icon: '🎯',
        criteria: { type: 'quiz_perfect', threshold: 1 },
        rarity: 'common',
        xpReward: 25,
      },
      {
        name: 'Quiz Master',
        description: 'Score 100% on 10 quizzes',
        icon: '🧠',
        criteria: { type: 'quiz_perfect', threshold: 10 },
        rarity: 'rare',
        xpReward: 150,
      },
      {
        name: 'Perfect Scholar',
        description: 'Score 100% on 50 quizzes',
        icon: '💎',
        criteria: { type: 'quiz_perfect', threshold: 50 },
        rarity: 'legendary',
        xpReward: 800,
      },
      
      // XP badges
      {
        name: 'Rising Star',
        description: 'Reach 1,000 XP',
        icon: '🌟',
        criteria: { type: 'xp_milestone', threshold: 1000 },
        rarity: 'common',
        xpReward: 100,
      },
      {
        name: 'XP Enthusiast',
        description: 'Reach 10,000 XP',
        icon: '💫',
        criteria: { type: 'xp_milestone', threshold: 10000 },
        rarity: 'epic',
        xpReward: 500,
      },
      {
        name: 'XP Legend',
        description: 'Reach 50,000 XP',
        icon: '🌌',
        criteria: { type: 'xp_milestone', threshold: 50000 },
        rarity: 'legendary',
        xpReward: 2000,
      },
      
      // Flashcard badges
      {
        name: 'Memory Maker',
        description: 'Master 10 flashcards',
        icon: '🧩',
        criteria: { type: 'flashcard_mastered', threshold: 10 },
        rarity: 'common',
        xpReward: 50,
      },
      {
        name: 'Recall Champion',
        description: 'Master 100 flashcards',
        icon: '🎴',
        criteria: { type: 'flashcard_mastered', threshold: 100 },
        rarity: 'epic',
        xpReward: 300,
      },
    ];

    const createdBadges = [];
    for (const badgeData of defaultBadges) {
      try {
        const existing = await Badge.findOne({ name: badgeData.name });
        if (!existing) {
          const badge = await Badge.create(badgeData);
          createdBadges.push(badge);
        }
      } catch (error) {
        console.error(`Error creating badge ${badgeData.name}:`, error);
      }
    }

    return createdBadges;
  }

  // Admin: Update badge
  async updateBadge(badgeId: string, data: any) {
    const badge = await Badge.findByIdAndUpdate(badgeId, data, { new: true });
    if (!badge) {
      throw new ApiError(404, 'Badge not found');
    }
    return badge;
  }

  // Admin: Delete badge
  async deleteBadge(badgeId: string) {
    const badge = await Badge.findByIdAndDelete(badgeId);
    if (!badge) {
      throw new ApiError(404, 'Badge not found');
    }
    // Remove badge from all users
    await User.updateMany({ badges: badgeId }, { $pull: { badges: badgeId } });
    return { message: 'Badge deleted successfully' };
  }

  // Admin: Manually award badge
  async manuallyAwardBadge(userId: string, badgeId: string, reason?: string) {
    console.log('🔍 [Service] Looking for user:', userId);
    const user = await User.findById(userId);
    if (!user) {
      console.error('❌ [Service] User not found:', userId);
      throw new ApiError(404, 'User not found');
    }
    console.log('✅ [Service] User found:', user.name);

    console.log('🔍 [Service] Looking for badge:', badgeId);
    // Use lean() to get plain object and bypass validation on existing data
    const badge = await Badge.findById(badgeId).lean();
    if (!badge) {
      console.error('❌ [Service] Badge not found:', badgeId);
      throw new ApiError(404, 'Badge not found');
    }
    console.log('✅ [Service] Badge found:', badge.name);

    // Check if user already has this badge
    if (user.badges.includes(badgeId as any)) {
      console.error('❌ [Service] User already has badge');
      throw new ApiError(400, 'User already has this badge');
    }

    try {
      console.log('🎯 [Service] Awarding badge to user...');
      user.badges.push(badgeId as any);
      await user.save({ validateBeforeSave: false });
      console.log('✅ [Service] Badge saved to user');

      // Create notification
      console.log('📨 [Service] Creating notification...');
      await Notification.create({
        user: userId,
        type: 'badge_earned',
        title: 'Badge Awarded!',
        message: `You have been awarded the "${badge.name}" badge! ${reason ? `Reason: ${reason}` : ''}`,
      });
      console.log('✅ [Service] Notification created');

      return { user, badge };
    } catch (error) {
      // Rollback: Remove badge from user if notification fails
      console.error('❌ [Service] Error occurred, rolling back...');
      user.badges = user.badges.filter((b: any) => b.toString() !== badgeId);
      await user.save({ validateBeforeSave: false });
      console.log('↩️ [Service] Badge removed from user');
      throw error;
    }
  }

  // Admin: Get all badges with statistics
  async getAllBadgesWithStats() {
    const badges = await Badge.find({});

    const badgesWithStats = await Promise.all(
      badges.map(async (badge) => {
        const earnedCount = await User.countDocuments({ badges: badge._id });
        return {
          ...badge.toObject(),
          earnedByCount: earnedCount,
        };
      })
    );

    return badgesWithStats;
  }
}

export default new BadgeService();

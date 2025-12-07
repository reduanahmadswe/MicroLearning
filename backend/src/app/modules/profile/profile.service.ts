import User from '../auth/auth.model';
import UserProgress from '../progressTracking/progress.model';
import { QuizAttempt } from '../quiz/quiz.model';
import { UserAchievement } from '../badge/badge.model';
import ApiError from '../../../utils/ApiError';
import {
  IUpdateProfileRequest,
  IUpdatePreferencesRequest,
  IUserProfileResponse,
  IPublicProfileResponse,
} from './profile.types';

class ProfileService {
  // Get user profile
  async getUserProfile(userId: string): Promise<IUserProfileResponse> {
    const user = await User.findById(userId)
      .select('-password -refreshToken')
      .lean();

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return { ...user, _id: user._id.toString() } as unknown as IUserProfileResponse;
  }

  // Get public profile
  async getPublicProfile(userId: string): Promise<IPublicProfileResponse> {
    const user = await User.findById(userId)
      .select('name profilePicture bio level xp badges createdAt')
      .populate('badges', 'name icon rarity')
      .lean();

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Get user statistics
    const [progressStats, quizStats] = await Promise.all([
      UserProgress.aggregate([
        { $match: { user: user._id } },
        {
          $group: {
            _id: null,
            lessonsCompleted: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            totalTimeSpent: { $sum: '$timeSpent' },
          },
        },
      ]),
      QuizAttempt.countDocuments({ user: user._id }),
    ]);

    const stats = progressStats[0] || {
      lessonsCompleted: 0,
      totalTimeSpent: 0,
    };

    return {
      _id: user._id.toString(),
      name: user.name,
      profilePicture: user.profilePicture,
      bio: user.bio,
      level: user.level,
      xp: user.xp,
      badges: user.badges || [],
      stats: {
        lessonsCompleted: stats.lessonsCompleted,
        quizzesCompleted: quizStats,
        currentStreak: user.streak?.current || 0,
        longestStreak: user.streak?.longest || 0,
        totalTimeSpent: stats.totalTimeSpent,
      },
      createdAt: user.createdAt,
    };
  }

  // Update user profile
  async updateProfile(
    userId: string,
    updateData: IUpdateProfileRequest
  ): Promise<IUserProfileResponse> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const userObj = user.toObject();
    return { ...userObj, _id: userObj._id.toString() } as unknown as IUserProfileResponse;
  }

  // Update learning preferences
  async updatePreferences(
    userId: string,
    preferences: IUpdatePreferencesRequest
  ): Promise<IUserProfileResponse> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { preferences } },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const userObj = user.toObject();
    return { ...userObj, _id: userObj._id.toString() } as unknown as IUserProfileResponse;
  }

  // Get user badges
  async getUserBadges(userId: string) {
    const user = await User.findById(userId).populate('badges').lean();

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user.badges;
  }

  // Get user statistics
  async getUserStatistics(userId: string) {
    const user = await User.findById(userId).lean();

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const [progressStats, quizStats, badgeStats] = await Promise.all([
      UserProgress.aggregate([
        { $match: { user: user._id } },
        {
          $group: {
            _id: null,
            totalLessons: { $sum: 1 },
            completedLessons: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            inProgressLessons: {
              $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] },
            },
            totalTimeSpent: { $sum: '$timeSpent' },
            averageMastery: { $avg: '$mastery' },
          },
        },
      ]),
      QuizAttempt.aggregate([
        { $match: { user: user._id } },
        {
          $group: {
            _id: null,
            totalAttempts: { $sum: 1 },
            perfectScores: {
              $sum: { $cond: [{ $eq: ['$isPerfect', true] }, 1, 0] },
            },
            averageScore: { $avg: '$score' },
          },
        },
      ]),
      UserAchievement.countDocuments({ user: user._id, isCompleted: true }),
    ]);

    const progress = progressStats[0] || {
      totalLessons: 0,
      completedLessons: 0,
      inProgressLessons: 0,
      totalTimeSpent: 0,
      averageMastery: 0,
    };

    const quiz = quizStats[0] || {
      totalAttempts: 0,
      perfectScores: 0,
      averageScore: 0,
    };

    return {
      profile: {
        level: user.level,
        xp: user.xp,
        coins: user.coins,
        currentStreak: user.streak?.current || 0,
        longestStreak: user.streak?.longest || 0,
      },
      learning: {
        totalLessons: progress.totalLessons,
        completedLessons: progress.completedLessons,
        inProgressLessons: progress.inProgressLessons,
        totalTimeSpent: progress.totalTimeSpent,
        averageMastery: Math.round(progress.averageMastery || 0),
      },
      quizzes: {
        totalAttempts: quiz.totalAttempts,
        perfectScores: quiz.perfectScores,
        averageScore: Math.round(quiz.averageScore || 0),
      },
      achievements: {
        totalBadges: badgeStats,
      },
    };
  }

  // Search users
  async searchUsers(query: string, limit: number = 20) {
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    })
      .select('name profilePicture bio level xp')
      .limit(limit)
      .lean();

    return users;
  }

  // Change password
  async changePassword(
    userId: string,
    data: { currentPassword: string; newPassword: string }
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(data.currentPassword);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    // Update password
    user.password = data.newPassword;
    await user.save();
  }

  // Update email
  async updateEmail(
    userId: string,
    data: { email: string; password: string }
  ): Promise<IUserProfileResponse> {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Password is incorrect');
    }

    // Check if new email is already in use
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new ApiError(409, 'Email is already in use');
    }

    // Update email
    user.email = data.email;
    await user.save();

    const updatedUser = await User.findById(userId).select('-password -refreshToken');
    const userObj = updatedUser!.toObject();
    return { ...userObj, _id: userObj._id.toString() } as unknown as IUserProfileResponse;
  }
}

export default new ProfileService();

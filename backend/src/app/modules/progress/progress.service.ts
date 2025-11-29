import httpStatus from 'http-status';
import { Types } from 'mongoose';
import ApiError from '../../../utils/ApiError';
import {
  ProgressShare,
  ProgressStats,
  ProgressMilestone,
  ActivityFeed,
} from './progress.model';
import {
  CreateProgressShareInput,
  UpdateProgressShareInput,
  AddReactionInput,
  AddCommentInput,
  GetProgressFeedQuery,
  UpdateProgressStatsInput,
  GetLeaderboardQuery,
  ILeaderboard,
  ICompareProgress,
  IActivityFeed,
  IProgressMilestone,
} from './progress.types';

// ==================== Progress Share Services ====================

export const createProgressShare = async (
  userId: string,
  shareData: CreateProgressShareInput
) => {
  const share = await ProgressShare.create({
    userId,
    ...shareData,
  });

  // Create activity feed entry
  await createActivityFeedEntry(
    userId,
    'progress_shared',
    shareData.title,
    shareData.description,
    { shareId: share._id, shareType: shareData.shareType },
    shareData.visibility
  );

  return share.populate('userId', 'username avatar');
};

export const getProgressShare = async (shareId: string) => {
  const share = await ProgressShare.findById(shareId)
    .populate('userId', 'username avatar')
    .populate('reactions.userId', 'username avatar')
    .populate('comments.userId', 'username avatar');

  if (!share) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Progress share not found');
  }

  // Increment view count
  share.viewCount += 1;
  await share.save();

  return share;
};

export const getProgressFeed = async (
  currentUserId: string,
  query: GetProgressFeedQuery
) => {
  const { visibility, shareType, userId, limit = 20, skip = 0 } = query;

  const filter: any = { isActive: true };

  // Apply filters
  if (visibility) {
    filter.visibility = visibility;
  } else {
    // Default: show public and friends' shares
    filter.$or = [
      { visibility: 'public' },
      { visibility: 'friends', userId: { $in: await getFriendIds(currentUserId) } },
      { userId: currentUserId }, // Always show own shares
    ];
  }

  if (shareType) {
    filter.shareType = shareType;
  }

  if (userId) {
    filter.userId = userId;
  }

  const [shares, total] = await Promise.all([
    ProgressShare.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username avatar')
      .populate('reactions.userId', 'username avatar')
      .populate('comments.userId', 'username avatar'),
    ProgressShare.countDocuments(filter),
  ]);

  return {
    shares,
    pagination: {
      total,
      limit,
      skip,
      hasMore: skip + limit < total,
    },
  };
};

export const updateProgressShare = async (
  shareId: string,
  userId: string,
  updateData: UpdateProgressShareInput
) => {
  const share = await ProgressShare.findOne({ _id: shareId, userId });

  if (!share) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Progress share not found or unauthorized');
  }

  Object.assign(share, updateData);
  await share.save();

  return share.populate('userId', 'username avatar');
};

export const deleteProgressShare = async (shareId: string, userId: string) => {
  const share = await ProgressShare.findOneAndDelete({ _id: shareId, userId });

  if (!share) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Progress share not found or unauthorized');
  }

  return share;
};

export const addReaction = async (
  shareId: string,
  userId: string,
  reactionData: AddReactionInput
) => {
  const share = await ProgressShare.findById(shareId);

  if (!share) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Progress share not found');
  }

  // Remove existing reaction from this user if any
  share.reactions = share.reactions.filter(
    (r) => r.userId.toString() !== userId
  );

  // Add new reaction
  share.reactions.push({
    userId: new Types.ObjectId(userId),
    reactionType: reactionData.reactionType,
    createdAt: new Date(),
  });

  await share.save();

  return share.populate('reactions.userId', 'username avatar');
};

export const removeReaction = async (shareId: string, userId: string) => {
  const share = await ProgressShare.findById(shareId);

  if (!share) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Progress share not found');
  }

  share.reactions = share.reactions.filter(
    (r) => r.userId.toString() !== userId
  );

  await share.save();

  return share;
};

export const addComment = async (
  shareId: string,
  userId: string,
  commentData: AddCommentInput
) => {
  const share = await ProgressShare.findById(shareId);

  if (!share) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Progress share not found');
  }

  share.comments.push({
    _id: new Types.ObjectId(),
    userId: new Types.ObjectId(userId),
    content: commentData.content,
    createdAt: new Date(),
  });

  await share.save();

  return share.populate('comments.userId', 'username avatar');
};

export const deleteComment = async (
  shareId: string,
  commentId: string,
  userId: string
) => {
  const share = await ProgressShare.findById(shareId);

  if (!share) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Progress share not found');
  }

  const comment = share.comments.find(
    (c) => c._id.toString() === commentId
  );

  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  // Only comment author or share author can delete
  if (
    comment.userId.toString() !== userId &&
    share.userId.toString() !== userId
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unauthorized to delete this comment');
  }

  share.comments = share.comments.filter(
    (c) => c._id.toString() !== commentId
  );

  await share.save();

  return share;
};

// ==================== Progress Stats Services ====================

export const getOrCreateProgressStats = async (userId: string) => {
  let stats = await ProgressStats.findOne({ userId });

  if (!stats) {
    stats = await ProgressStats.create({
      userId,
      totalXP: 0,
      currentLevel: 1,
      currentStreak: 0,
      longestStreak: 0,
      completedLessons: 0,
      completedCourses: 0,
      totalStudyTime: 0,
      achievementsCount: 0,
      challengesWon: 0,
      rank: 0,
    });
  }

  return stats;
};

export const updateProgressStats = async (
  userId: string,
  updateData: UpdateProgressStatsInput
) => {
  const stats = await getOrCreateProgressStats(userId);

  if (updateData.xpGained) {
    stats.totalXP += updateData.xpGained;
    
    // Check for level up
    const newLevel = calculateLevel(stats.totalXP);
    if (newLevel > stats.currentLevel) {
      stats.currentLevel = newLevel;
      
      // Create level up activity
      await createActivityFeedEntry(
        userId,
        'level_up',
        `Reached Level ${newLevel}!`,
        `Congratulations on reaching level ${newLevel}!`,
        { level: newLevel, xp: stats.totalXP },
        'friends'
      );

      // Check for level milestones
      await checkAndCreateMilestone(userId, `level_${newLevel}` as any);
    }
  }

  if (updateData.lessonCompleted) {
    stats.completedLessons += 1;
    
    // Check for lesson milestones
    if (stats.completedLessons === 1) {
      await checkAndCreateMilestone(userId, 'first_lesson');
    } else if (stats.completedLessons === 10) {
      await checkAndCreateMilestone(userId, '10_lessons');
    } else if (stats.completedLessons === 100) {
      await checkAndCreateMilestone(userId, '100_lessons');
    }
  }

  if (updateData.courseCompleted) {
    stats.completedCourses += 1;
    
    // Check for course milestones
    if (stats.completedCourses === 1) {
      await checkAndCreateMilestone(userId, 'first_course');
    } else if (stats.completedCourses === 10) {
      await checkAndCreateMilestone(userId, '10_courses');
    }
  }

  if (updateData.studyTimeMinutes) {
    stats.totalStudyTime += updateData.studyTimeMinutes;
  }

  if (updateData.challengeWon) {
    stats.challengesWon += 1;
  }

  // Check XP milestones
  if (stats.totalXP >= 1000 && stats.totalXP - (updateData.xpGained || 0) < 1000) {
    await checkAndCreateMilestone(userId, '1000_xp');
  }
  if (stats.totalXP >= 10000 && stats.totalXP - (updateData.xpGained || 0) < 10000) {
    await checkAndCreateMilestone(userId, '10000_xp');
  }

  stats.lastUpdated = new Date();
  await stats.save();

  // Update rank
  await updateUserRank(userId);

  return stats;
};

export const getUserStats = async (userId: string) => {
  const stats = await getOrCreateProgressStats(userId);
  return stats;
};

export const compareProgress = async (
  userId1: string,
  userId2: string
): Promise<ICompareProgress> => {
  const [stats1, stats2, user1, user2] = await Promise.all([
    getOrCreateProgressStats(userId1),
    getOrCreateProgressStats(userId2),
    // Assume User model exists
    { username: 'User1' }, // Replace with actual User.findById(userId1)
    { username: 'User2' }, // Replace with actual User.findById(userId2)
  ]);

  const comparison = [
    {
      category: 'Total XP',
      user1Value: stats1.totalXP,
      user2Value: stats2.totalXP,
      difference: stats1.totalXP - stats2.totalXP,
      leader: stats1.totalXP > stats2.totalXP ? 'user1' : stats1.totalXP < stats2.totalXP ? 'user2' : 'tie',
    },
    {
      category: 'Current Level',
      user1Value: stats1.currentLevel,
      user2Value: stats2.currentLevel,
      difference: stats1.currentLevel - stats2.currentLevel,
      leader: stats1.currentLevel > stats2.currentLevel ? 'user1' : stats1.currentLevel < stats2.currentLevel ? 'user2' : 'tie',
    },
    {
      category: 'Current Streak',
      user1Value: stats1.currentStreak,
      user2Value: stats2.currentStreak,
      difference: stats1.currentStreak - stats2.currentStreak,
      leader: stats1.currentStreak > stats2.currentStreak ? 'user1' : stats1.currentStreak < stats2.currentStreak ? 'user2' : 'tie',
    },
    {
      category: 'Completed Lessons',
      user1Value: stats1.completedLessons,
      user2Value: stats2.completedLessons,
      difference: stats1.completedLessons - stats2.completedLessons,
      leader: stats1.completedLessons > stats2.completedLessons ? 'user1' : stats1.completedLessons < stats2.completedLessons ? 'user2' : 'tie',
    },
    {
      category: 'Completed Courses',
      user1Value: stats1.completedCourses,
      user2Value: stats2.completedCourses,
      difference: stats1.completedCourses - stats2.completedCourses,
      leader: stats1.completedCourses > stats2.completedCourses ? 'user1' : stats1.completedCourses < stats2.completedCourses ? 'user2' : 'tie',
    },
    {
      category: 'Challenges Won',
      user1Value: stats1.challengesWon,
      user2Value: stats2.challengesWon,
      difference: stats1.challengesWon - stats2.challengesWon,
      leader: stats1.challengesWon > stats2.challengesWon ? 'user1' : stats1.challengesWon < stats2.challengesWon ? 'user2' : 'tie',
    },
  ] as ICompareProgress['comparison'];

  return {
    user1: {
      userId: new Types.ObjectId(userId1),
      username: user1.username,
      stats: {
        totalXP: stats1.totalXP,
        currentLevel: stats1.currentLevel,
        currentStreak: stats1.currentStreak,
        completedLessons: stats1.completedLessons,
        completedCourses: stats1.completedCourses,
        challengesWon: stats1.challengesWon,
      },
    },
    user2: {
      userId: new Types.ObjectId(userId2),
      username: user2.username,
      stats: {
        totalXP: stats2.totalXP,
        currentLevel: stats2.currentLevel,
        currentStreak: stats2.currentStreak,
        completedLessons: stats2.completedLessons,
        completedCourses: stats2.completedCourses,
        challengesWon: stats2.challengesWon,
      },
    },
    comparison,
  };
};

// ==================== Leaderboard Services ====================

export const getLeaderboard = async (
  query: GetLeaderboardQuery
): Promise<ILeaderboard> => {
  const { timeframe, category, limit = 50 } = query;

  let sortField: string;
  switch (category) {
    case 'xp':
      sortField = 'totalXP';
      break;
    case 'streak':
      sortField = 'currentStreak';
      break;
    case 'lessons':
      sortField = 'completedLessons';
      break;
    case 'challenges':
      sortField = 'challengesWon';
      break;
    default:
      sortField = 'totalXP';
  }

  // TODO: Implement timeframe filtering based on lastUpdated or createdAt
  // For now, showing all-time leaderboard

  const stats = await ProgressStats.find()
    .sort({ [sortField]: -1 })
    .limit(limit)
    .populate('userId', 'username avatar');

  const entries = stats.map((stat, index) => ({
    userId: stat.userId,
    rank: index + 1,
    value: (stat as any)[sortField],
    change: 0, // TODO: Calculate rank change from previous period
  }));

  return {
    timeframe,
    category,
    entries,
    generatedAt: new Date(),
  };
};

// ==================== Milestone Services ====================

export const getUserMilestones = async (userId: string) => {
  const milestones = await ProgressMilestone.find({ userId }).sort({
    achievedAt: -1,
  });

  return milestones;
};

export const shareMilestone = async (
  milestoneId: string,
  userId: string,
  visibility: 'public' | 'friends' | 'private'
) => {
  const milestone = await ProgressMilestone.findOne({
    _id: milestoneId,
    userId,
  });

  if (!milestone) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Milestone not found');
  }

  if (milestone.shared) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Milestone already shared');
  }

  // Create progress share
  const title = getMilestoneTitle(milestone.milestoneType);
  const description = getMilestoneDescription(milestone.milestoneType);

  await createProgressShare(userId, {
    shareType: 'achievement',
    title,
    description,
    metadata: {
      streakDays: milestone.milestoneType.includes('streak')
        ? parseInt(milestone.milestoneType.match(/\d+/)?.[0] || '0')
        : undefined,
      level: milestone.milestoneType.includes('level')
        ? parseInt(milestone.milestoneType.match(/\d+/)?.[0] || '0')
        : undefined,
      xpGained: milestone.milestoneType.includes('xp')
        ? parseInt(milestone.milestoneType.match(/\d+/)?.[0] || '0')
        : undefined,
    },
    visibility,
  });

  milestone.shared = true;
  milestone.sharedAt = new Date();
  await milestone.save();

  return milestone;
};

// ==================== Activity Feed Services ====================

export const getActivityFeed = async (
  currentUserId: string,
  query: any
) => {
  const { userId, activityType, visibility, limit = 20, skip = 0 } = query;

  const filter: any = { isActive: true };

  if (userId) {
    filter.userId = userId;
  } else {
    // Show public activities and friends' activities
    filter.$or = [
      { visibility: 'public' },
      { visibility: 'friends', userId: { $in: await getFriendIds(currentUserId) } },
      { userId: currentUserId },
    ];
  }

  if (activityType) {
    filter.activityType = activityType;
  }

  if (visibility) {
    filter.visibility = visibility;
  }

  const [activities, total] = await Promise.all([
    ActivityFeed.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username avatar'),
    ActivityFeed.countDocuments(filter),
  ]);

  return {
    activities,
    pagination: {
      total,
      limit,
      skip,
      hasMore: skip + limit < total,
    },
  };
};

export const createActivityFeedEntry = async (
  userId: string,
  activityType: IActivityFeed['activityType'],
  title: string,
  description: string,
  metadata: Record<string, any> = {},
  visibility: 'public' | 'friends' | 'private' = 'friends'
) => {
  const activity = await ActivityFeed.create({
    userId,
    activityType,
    title,
    description,
    metadata,
    visibility,
  });

  return activity;
};

// ==================== Helper Functions ====================

const calculateLevel = (xp: number): number => {
  // Simple level calculation: 100 XP per level
  return Math.floor(xp / 100) + 1;
};

const updateUserRank = async (userId: string) => {
  const stats = await ProgressStats.findOne({ userId });
  if (!stats) return;

  const rank = await ProgressStats.countDocuments({
    totalXP: { $gt: stats.totalXP },
  });

  stats.rank = rank + 1;
  await stats.save();
};

const checkAndCreateMilestone = async (
  userId: string,
  milestoneType: IProgressMilestone['milestoneType']
) => {
  try {
    const milestone = await ProgressMilestone.create({
      userId,
      milestoneType,
    });

    // Create activity feed entry
    const title = getMilestoneTitle(milestoneType);
    const description = getMilestoneDescription(milestoneType);

    await createActivityFeedEntry(
      userId,
      'achievement_earned',
      title,
      description,
      { milestoneId: milestone._id, milestoneType },
      'friends'
    );

    return milestone;
  } catch (error: any) {
    // Ignore duplicate key errors (milestone already exists)
    if (error.code !== 11000) {
      throw error;
    }
    return null;
  }
};

const getMilestoneTitle = (milestoneType: string): string => {
  const titles: Record<string, string> = {
    first_lesson: 'First Lesson Complete! 🎉',
    '10_lessons': '10 Lessons Complete! 📚',
    '100_lessons': '100 Lessons Complete! 🏆',
    first_course: 'First Course Complete! 🎓',
    '10_courses': '10 Courses Complete! 🌟',
    '7_day_streak': '7 Day Streak! 🔥',
    '30_day_streak': '30 Day Streak! 🔥🔥',
    '100_day_streak': '100 Day Streak! 🔥🔥🔥',
    level_10: 'Level 10 Reached! ⭐',
    level_50: 'Level 50 Reached! ⭐⭐',
    '1000_xp': '1000 XP Earned! 💎',
    '10000_xp': '10000 XP Earned! 💎💎',
  };

  return titles[milestoneType] || 'Achievement Unlocked!';
};

const getMilestoneDescription = (milestoneType: string): string => {
  const descriptions: Record<string, string> = {
    first_lesson: 'Congratulations on completing your first lesson!',
    '10_lessons': 'You\'ve completed 10 lessons. Keep up the great work!',
    '100_lessons': 'Amazing! You\'ve completed 100 lessons!',
    first_course: 'You completed your first course!',
    '10_courses': 'You\'ve completed 10 courses. You\'re on fire!',
    '7_day_streak': 'You\'ve been learning for 7 days straight!',
    '30_day_streak': '30 days of consistent learning. Outstanding!',
    '100_day_streak': '100 days of learning! You\'re a legend!',
    level_10: 'You reached level 10!',
    level_50: 'You reached level 50! Incredible progress!',
    '1000_xp': 'You\'ve earned 1000 XP!',
    '10000_xp': 'You\'ve earned 10000 XP! Amazing!',
  };

  return descriptions[milestoneType] || 'You unlocked a new achievement!';
};

const getFriendIds = async (_userId: string): Promise<string[]> => {
  // TODO: Implement friend fetching from Friend model
  // For now, returning empty array
  // const friends = await Friend.find({ userId: _userId, status: 'accepted' });
  // return friends.map(f => f.friendId.toString());
  return [];
};

export default {
  createProgressShare,
  getProgressShare,
  getProgressFeed,
  updateProgressShare,
  deleteProgressShare,
  addReaction,
  removeReaction,
  addComment,
  deleteComment,
  getOrCreateProgressStats,
  updateProgressStats,
  getUserStats,
  compareProgress,
  getLeaderboard,
  getUserMilestones,
  shareMilestone,
  getActivityFeed,
  createActivityFeedEntry,
};

import httpStatus from 'http-status';
import ApiError from '../../../utils/ApiError';
import {
  DailyChallenge,
  DailyChallengeProgress,
  DailyChallengeStreak,
  WeeklyChallenge,
  WeeklyChallengeProgress,
} from './dailyChallenge.model';
import {
  CreateDailyChallengeInput,
  CreateWeeklyChallengeInput,
  UpdateChallengeProgressInput,
  GetActiveChallengesQuery,
  GetChallengeHistoryQuery,
} from './dailyChallenge.types';

// ==================== Daily Challenge Services ====================

export const createDailyChallenge = async (challengeData: CreateDailyChallengeInput) => {
  const challenge = await DailyChallenge.create(challengeData);
  return challenge;
};

export const getActiveDailyChallenges = async (query: GetActiveChallengesQuery) => {
  const { difficulty, challengeType, limit = 20, skip = 0 } = query;

  const filter: any = {
    isActive: true,
    availableDate: { $lte: new Date() },
    expiresAt: { $gt: new Date() },
  };

  if (difficulty) {
    filter.difficulty = difficulty;
  }

  if (challengeType) {
    filter.challengeType = challengeType;
  }

  const [challenges, total] = await Promise.all([
    DailyChallenge.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    DailyChallenge.countDocuments(filter),
  ]);

  return {
    challenges,
    pagination: {
      total,
      limit,
      skip,
      hasMore: skip + limit < total,
    },
  };
};

export const getDailyChallengeById = async (challengeId: string) => {
  const challenge = await DailyChallenge.findById(challengeId);

  if (!challenge) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Daily challenge not found');
  }

  return challenge;
};

export const getUserDailyChallenges = async (userId: string) => {
  const now = new Date();

  // Get active daily challenges
  const activeChallenges = await DailyChallenge.find({
    isActive: true,
    availableDate: { $lte: now },
    expiresAt: { $gt: now },
  });

  // Get user's progress for these challenges
  const progressRecords = await DailyChallengeProgress.find({
    userId,
    challengeId: { $in: activeChallenges.map((c) => c._id) },
  });

  // Map progress to challenges
  const challengesWithProgress = activeChallenges.map((challenge) => {
    const progress = progressRecords.find(
      (p) => p.challengeId.toString() === challenge._id.toString()
    );

    return {
      challenge,
      progress: progress || null,
      progressPercentage: progress
        ? Math.round((progress.progress / progress.target) * 100)
        : 0,
    };
  });

  return challengesWithProgress;
};

export const updateDailyChallengeProgress = async (
  userId: string,
  updateData: UpdateChallengeProgressInput
) => {
  const { challengeId, progressIncrement, metadata } = updateData;

  const challenge = await DailyChallenge.findById(challengeId);

  if (!challenge) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Challenge not found');
  }

  // Check if challenge is still active
  const now = new Date();
  if (now < challenge.availableDate || now > challenge.expiresAt) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Challenge is not currently active');
  }

  // Get or create progress record
  let progress = await DailyChallengeProgress.findOne({
    userId,
    challengeId,
  });

  if (!progress) {
    progress = await DailyChallengeProgress.create({
      userId,
      challengeId,
      progress: 0,
      target: challenge.target,
      metadata: metadata || {},
    });
  }

  // Update progress
  progress.progress += progressIncrement;

  // Merge metadata
  if (metadata) {
    progress.metadata = {
      ...progress.metadata,
      ...metadata,
    };
  }

  // Check if challenge is completed
  if (progress.progress >= progress.target && !progress.isCompleted) {
    progress.isCompleted = true;
    progress.completedAt = new Date();

    // Update streak
    await updateChallengeStreak(userId);
  }

  await progress.save();

  return progress.populate('challengeId');
};

export const claimDailyChallengeRewards = async (userId: string, challengeId: string) => {
  const progress = await DailyChallengeProgress.findOne({
    userId,
    challengeId,
  }).populate('challengeId');

  if (!progress) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Challenge progress not found');
  }

  if (!progress.isCompleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Challenge not completed yet');
  }

  if (progress.rewardsClaimed) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Rewards already claimed');
  }

  const challenge = progress.challengeId as any;
  const streak = await getOrCreateStreak(userId);

  // Apply streak bonus
  const bonusMultiplier = streak.streakBonusMultiplier;
  const finalRewards = {
    xp: Math.floor(challenge.rewards.xp * bonusMultiplier),
    coins: challenge.rewards.coins
      ? Math.floor(challenge.rewards.coins * bonusMultiplier)
      : undefined,
    badgeId: challenge.rewards.badgeId,
    itemId: challenge.rewards.itemId,
  };

  // Mark rewards as claimed
  progress.rewardsClaimed = true;
  progress.claimedAt = new Date();
  await progress.save();

  // TODO: Actually grant rewards to user (update user's XP, coins, etc.)
  // This would integrate with user profile/progress tracking module

  return {
    rewards: finalRewards,
    bonusMultiplier,
    streakDays: streak.currentStreak,
  };
};

export const getUserChallengeHistory = async (
  userId: string,
  query: GetChallengeHistoryQuery
) => {
  const { status, limit = 20, skip = 0 } = query;

  const filter: any = { userId };

  if (status === 'completed') {
    filter.isCompleted = true;
  } else if (status === 'in-progress') {
    filter.isCompleted = false;
  } else if (status === 'failed') {
    filter.isCompleted = false;
    // Also check if expired
    filter.$expr = {
      $gt: [new Date(), { $toDate: '$expiresAt' }],
    };
  }

  const [progressRecords, total] = await Promise.all([
    DailyChallengeProgress.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('challengeId'),
    DailyChallengeProgress.countDocuments(filter),
  ]);

  return {
    history: progressRecords,
    pagination: {
      total,
      limit,
      skip,
      hasMore: skip + limit < total,
    },
  };
};

// ==================== Weekly Challenge Services ====================

export const createWeeklyChallenge = async (challengeData: CreateWeeklyChallengeInput) => {
  const challenge = await WeeklyChallenge.create(challengeData);
  return challenge;
};

export const getActiveWeeklyChallenges = async (query: GetActiveChallengesQuery) => {
  const { difficulty, challengeType, limit = 20, skip = 0 } = query;

  const filter: any = {
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gt: new Date() },
  };

  if (difficulty) {
    filter.difficulty = difficulty;
  }

  if (challengeType) {
    filter.challengeType = challengeType;
  }

  const [challenges, total] = await Promise.all([
    WeeklyChallenge.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    WeeklyChallenge.countDocuments(filter),
  ]);

  return {
    challenges,
    pagination: {
      total,
      limit,
      skip,
      hasMore: skip + limit < total,
    },
  };
};

export const getUserWeeklyChallenges = async (userId: string) => {
  const now = new Date();

  // Get active weekly challenges
  const activeChallenges = await WeeklyChallenge.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gt: now },
  });

  // Get user's progress for these challenges
  const progressRecords = await WeeklyChallengeProgress.find({
    userId,
    challengeId: { $in: activeChallenges.map((c) => c._id) },
  });

  // Map progress to challenges
  const challengesWithProgress = activeChallenges.map((challenge) => {
    const progress = progressRecords.find(
      (p) => p.challengeId.toString() === challenge._id.toString()
    );

    return {
      challenge,
      progress: progress || null,
      progressPercentage: progress
        ? Math.round((progress.progress / progress.target) * 100)
        : 0,
    };
  });

  return challengesWithProgress;
};

export const updateWeeklyChallengeProgress = async (
  userId: string,
  updateData: UpdateChallengeProgressInput
) => {
  const { challengeId, progressIncrement, metadata } = updateData;

  const challenge = await WeeklyChallenge.findById(challengeId);

  if (!challenge) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Weekly challenge not found');
  }

  // Check if challenge is still active
  const now = new Date();
  if (now < challenge.startDate || now > challenge.endDate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Challenge is not currently active');
  }

  // Get or create progress record
  let progress = await WeeklyChallengeProgress.findOne({
    userId,
    challengeId,
  });

  if (!progress) {
    progress = await WeeklyChallengeProgress.create({
      userId,
      challengeId,
      progress: 0,
      target: challenge.target,
      metadata: metadata || {},
    });
  }

  // Update progress
  progress.progress += progressIncrement;

  // Merge metadata
  if (metadata) {
    progress.metadata = {
      ...progress.metadata,
      ...metadata,
    };
  }

  // Check if challenge is completed
  if (progress.progress >= progress.target && !progress.isCompleted) {
    progress.isCompleted = true;
    progress.completedAt = new Date();

    // Calculate rank
    const rank = await WeeklyChallengeProgress.countDocuments({
      challengeId,
      progress: { $gt: progress.progress },
    });
    progress.rank = rank + 1;
  }

  await progress.save();

  return progress.populate('challengeId');
};

export const claimWeeklyChallengeRewards = async (userId: string, challengeId: string) => {
  const progress = await WeeklyChallengeProgress.findOne({
    userId,
    challengeId,
  }).populate('challengeId');

  if (!progress) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Challenge progress not found');
  }

  if (!progress.isCompleted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Challenge not completed yet');
  }

  if (progress.rewardsClaimed) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Rewards already claimed');
  }

  const challenge = progress.challengeId as any;

  // Apply rank bonus (top performers get extra rewards)
  let rankBonus = 1.0;
  if (progress.rank === 1) rankBonus = 1.5;
  else if (progress.rank! <= 3) rankBonus = 1.3;
  else if (progress.rank! <= 10) rankBonus = 1.2;

  const finalRewards = {
    xp: Math.floor(challenge.rewards.xp * rankBonus),
    coins: challenge.rewards.coins
      ? Math.floor(challenge.rewards.coins * rankBonus)
      : undefined,
    badgeId: challenge.rewards.badgeId,
    itemId: challenge.rewards.itemId,
    exclusiveContent: challenge.rewards.exclusiveContent,
  };

  // Mark rewards as claimed
  progress.rewardsClaimed = true;
  progress.claimedAt = new Date();
  await progress.save();

  return {
    rewards: finalRewards,
    rank: progress.rank,
    rankBonus,
  };
};

export const getWeeklyChallengeLeaderboard = async (challengeId: string, limit = 100) => {
  const progressRecords = await WeeklyChallengeProgress.find({
    challengeId,
  })
    .sort({ progress: -1, updatedAt: 1 })
    .limit(limit)
    .populate('userId', 'username avatar');

  const leaderboard = progressRecords.map((record, index) => ({
    rank: index + 1,
    userId: record.userId,
    progress: record.progress,
    target: record.target,
    progressPercentage: Math.round((record.progress / record.target) * 100),
    isCompleted: record.isCompleted,
    completedAt: record.completedAt,
  }));

  return leaderboard;
};

// ==================== Streak Services ====================

export const getUserStreak = async (userId: string) => {
  const streak = await getOrCreateStreak(userId);
  return streak;
};

const getOrCreateStreak = async (userId: string) => {
  let streak = await DailyChallengeStreak.findOne({ userId });

  if (!streak) {
    streak = await DailyChallengeStreak.create({
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: new Date(),
      totalChallengesCompleted: 0,
      streakBonusMultiplier: 1.0,
      milestones: [],
    });
  }

  return streak;
};

const updateChallengeStreak = async (userId: string) => {
  const streak = await getOrCreateStreak(userId);
  const now = new Date();
  const lastCompleted = new Date(streak.lastCompletedDate);

  // Check if user completed a challenge today
  const isToday =
    lastCompleted.getDate() === now.getDate() &&
    lastCompleted.getMonth() === now.getMonth() &&
    lastCompleted.getFullYear() === now.getFullYear();

  if (isToday) {
    // Already updated today, just increment total
    streak.totalChallengesCompleted += 1;
  } else {
    // Check if it's consecutive days
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const isYesterday =
      lastCompleted.getDate() === yesterday.getDate() &&
      lastCompleted.getMonth() === yesterday.getMonth() &&
      lastCompleted.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      // Streak continues
      streak.currentStreak += 1;
      streak.totalChallengesCompleted += 1;

      // Update longest streak
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }

      // Check for streak milestones
      await checkStreakMilestones(streak);

      // Update bonus multiplier (max 3x at 100 day streak)
      streak.streakBonusMultiplier = Math.min(
        3.0,
        1.0 + (streak.currentStreak / 100) * 2.0
      );
    } else {
      // Streak broken, reset
      streak.currentStreak = 1;
      streak.totalChallengesCompleted += 1;
      streak.streakBonusMultiplier = 1.0;
    }

    streak.lastCompletedDate = now;
  }

  await streak.save();
  return streak;
};

const checkStreakMilestones = async (streak: any) => {
  const milestones = [7, 14, 30, 50, 100, 200, 365];
  const currentStreak = streak.currentStreak;

  for (const milestone of milestones) {
    if (
      currentStreak === milestone &&
      !streak.milestones.some((m: any) => m.streakDays === milestone)
    ) {
      // Award milestone rewards
      const bonusRewards = {
        xp: milestone * 10,
        coins: milestone * 5,
      };

      streak.milestones.push({
        streakDays: milestone,
        achievedAt: new Date(),
        bonusRewards,
      });

      // TODO: Grant bonus rewards to user
    }
  }
};

// ==================== Auto-Generate Daily Challenges ====================

export const generateDailyChallenges = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  // Check if challenges already exist for tomorrow
  const existingChallenges = await DailyChallenge.find({
    availableDate: { $gte: tomorrow, $lt: dayAfterTomorrow },
  });

  if (existingChallenges.length > 0) {
    return { message: 'Challenges already generated for tomorrow' };
  }

  // Generate 3 daily challenges (easy, medium, hard)
  const challengeTemplates = [
    {
      challengeType: 'lesson_completion' as const,
      title: 'Quick Learner',
      description: 'Complete 3 micro-lessons today',
      difficulty: 'easy' as const,
      target: 3,
      requirement: { lessonCount: 3 },
      rewards: { xp: 50, coins: 10 },
    },
    {
      challengeType: 'quiz_score' as const,
      title: 'Quiz Master',
      description: 'Score 80% or higher on 2 quizzes',
      difficulty: 'medium' as const,
      target: 2,
      requirement: { quizScore: 80 },
      rewards: { xp: 100, coins: 25 },
    },
    {
      challengeType: 'study_time' as const,
      title: 'Dedicated Student',
      description: 'Study for 60 minutes today',
      difficulty: 'hard' as const,
      target: 60,
      requirement: { studyTimeMinutes: 60 },
      rewards: { xp: 200, coins: 50 },
    },
  ];

  const createdChallenges = await Promise.all(
    challengeTemplates.map((template) =>
      DailyChallenge.create({
        ...template,
        availableDate: tomorrow,
        expiresAt: dayAfterTomorrow,
        isActive: true,
      })
    )
  );

  return {
    message: 'Daily challenges generated successfully',
    challenges: createdChallenges,
  };
};

export default {
  createDailyChallenge,
  getActiveDailyChallenges,
  getDailyChallengeById,
  getUserDailyChallenges,
  updateDailyChallengeProgress,
  claimDailyChallengeRewards,
  getUserChallengeHistory,
  createWeeklyChallenge,
  getActiveWeeklyChallenges,
  getUserWeeklyChallenges,
  updateWeeklyChallengeProgress,
  claimWeeklyChallengeRewards,
  getWeeklyChallengeLeaderboard,
  getUserStreak,
  generateDailyChallenges,
};

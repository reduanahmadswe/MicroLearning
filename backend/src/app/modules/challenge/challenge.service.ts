import { Challenge, ChallengeProgress, UserChallenge } from './challenge.model';
import { ICreateChallengeRequest, IChallengeStats, IDailyChallengeResponse } from './challenge.types';
import ApiError from '../../../utils/ApiError';
import httpStatus from 'http-status';
import User from '../auth/auth.model';
import UserProgress from '../progressTracking/progress.model';
import { QuizAttempt } from '../quiz/quiz.model';
import Notification from '../notification/notification.model';
import { Friend } from '../friend/friend.model';

// Create challenge (admin/instructor only)
const createChallenge = async (userId: string, data: ICreateChallengeRequest) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  if (endDate <= startDate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'End date must be after start date');
  }

  const challenge = await Challenge.create({
    ...data,
    startDate,
    endDate,
    createdBy: userId,
  });

  return challenge;
};

// Get daily challenge
const getDailyChallenge = async (userId: string): Promise<IDailyChallengeResponse> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Find active challenge for today
  const dailyChallenge = await Challenge.findOne({
    isActive: true,
    startDate: { $lte: today },
    endDate: { $gte: tomorrow },
    type: { $ne: 'custom' }, // Exclude custom challenges
  }).sort({ createdAt: -1 });

  if (!dailyChallenge) {
    return {
      dailyChallenge: null,
      progress: null,
      isCompleted: false,
    };
  }

  // Get user's progress on this challenge
  let progress = await ChallengeProgress.findOne({
    user: userId,
    challenge: dailyChallenge._id,
  });

  // If no progress exists, create one
  if (!progress) {
    progress = await ChallengeProgress.create({
      user: userId,
      challenge: dailyChallenge._id,
      status: 'not_started',
    });
  }

  return {
    dailyChallenge,
    progress,
    isCompleted: progress.status === 'completed',
  };
};

// Get all active challenges
const getActiveChallenges = async (
  userId: string,
  filters: { type?: string; difficulty?: string; page?: number; limit?: number }
) => {
  const { type, difficulty, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const query: any = {
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  };

  if (type) query.type = type;
  if (difficulty) query.difficulty = difficulty;

  const challenges = await Challenge.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

  const total = await Challenge.countDocuments(query);

  // Get user's progress for each challenge
  const challengesWithProgress = await Promise.all(
    challenges.map(async (challenge) => {
      const progress = await ChallengeProgress.findOne({
        user: userId,
        challenge: challenge._id,
      });

      return {
        ...challenge.toObject(),
        userProgress: progress || null,
      };
    })
  );

  return {
    challenges: challengesWithProgress,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Update challenge progress
const updateChallengeProgress = async (userId: string, challengeId: string) => {
  const challenge = await Challenge.findById(challengeId);

  if (!challenge) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Challenge not found');
  }

  if (!challenge.isActive) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Challenge is not active');
  }

  const now = new Date();
  if (now < challenge.startDate || now > challenge.endDate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Challenge is not available at this time');
  }

  let progress = await ChallengeProgress.findOne({
    user: userId,
    challenge: challengeId,
  });

  if (!progress) {
    progress = await ChallengeProgress.create({
      user: userId,
      challenge: challengeId,
      status: 'in_progress',
      startedAt: new Date(),
    });
  }

  // Calculate progress based on challenge type
  let currentProgress = 0;

  switch (challenge.type) {
    case 'lesson':
      const lessonCount = await UserProgress.countDocuments({
        user: userId,
        status: 'completed',
        completedAt: { $gte: challenge.startDate, $lte: challenge.endDate },
      });
      currentProgress = Math.min((lessonCount / challenge.requirements.target) * 100, 100);
      break;

    case 'quiz':
      const quizCount = await QuizAttempt.countDocuments({
        user: userId,
        completedAt: { $gte: challenge.startDate, $lte: challenge.endDate },
      });
      currentProgress = Math.min((quizCount / challenge.requirements.target) * 100, 100);
      break;

    case 'streak':
      const user = await User.findById(userId);
      if (user && user.streak) {
        currentProgress = Math.min((user.streak.current / challenge.requirements.target) * 100, 100);
      }
      break;

    case 'flashcard':
      // Implementation depends on flashcard review tracking
      currentProgress = progress.progress; // Keep current progress for now
      break;
  }

  progress.progress = currentProgress;

  if (currentProgress >= 100 && progress.status !== 'completed') {
    progress.status = 'completed';
    progress.completedAt = new Date();

    // Award XP and coins
    const user = await User.findById(userId);
    if (user) {
      user.xp += challenge.xpReward;
      if (challenge.coinsReward) {
        user.coins = (user.coins || 0) + challenge.coinsReward;
      }
      user.level = Math.floor(user.xp / 100) + 1;
      await user.save();

      // Create notification
      await Notification.create({
        user: userId,
        type: 'system_announcement',
        title: 'Challenge Completed!',
        message: `You completed "${challenge.title}" and earned ${challenge.xpReward} XP${challenge.coinsReward ? ` and ${challenge.coinsReward} coins` : ''}!`,
        metadata: {
          challengeId: challenge._id.toString(),
          xpEarned: challenge.xpReward,
          coinsEarned: challenge.coinsReward || 0,
        },
      });
    }
  } else if (progress.status === 'not_started') {
    progress.status = 'in_progress';
    progress.startedAt = new Date();
  }

  await progress.save();

  return progress;
};

// Challenge a friend
const challengeFriend = async (userId: string, opponentId: string, challengeId: string) => {
  if (userId === opponentId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot challenge yourself');
  }

  // Check if they are friends
  const friendship = await Friend.findOne({
    user: userId,
    friend: opponentId,
    status: 'accepted',
  });

  if (!friendship) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You can only challenge your friends');
  }

  const challenge = await Challenge.findById(challengeId);
  if (!challenge) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Challenge not found');
  }

  if (!challenge.isActive) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Challenge is not active');
  }

  // Create user challenge
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

  const userChallenge = await UserChallenge.create({
    challenger: userId,
    opponent: opponentId,
    challenge: challengeId,
    status: 'pending',
    expiresAt,
  });

  // Create notification
  const challenger = await User.findById(userId);
  await Notification.create({
    user: opponentId,
    type: 'friend_request',
    title: 'New Challenge',
    message: `${challenger?.name || 'Someone'} challenged you to "${challenge.title}"`,
    metadata: {
      userChallengeId: userChallenge._id.toString(),
      challengerId: userId,
      challengerName: challenger?.name || 'Unknown',
      challengeTitle: challenge.title,
    },
  });

  return userChallenge;
};

// Respond to friend challenge
const respondToFriendChallenge = async (userId: string, userChallengeId: string, action: 'accept' | 'reject') => {
  const userChallenge = await UserChallenge.findById(userChallengeId);

  if (!userChallenge) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Challenge not found');
  }

  if (userChallenge.opponent.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized');
  }

  if (userChallenge.status !== 'pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Challenge already responded to');
  }

  if (action === 'accept') {
    userChallenge.status = 'in_progress';
    userChallenge.startedAt = new Date();
  } else {
    userChallenge.status = 'rejected';
  }

  await userChallenge.save();

  // Notify challenger
  const opponent = await User.findById(userId);
  const challenge = await Challenge.findById(userChallenge.challenge);

  await Notification.create({
    user: userChallenge.challenger,
    type: 'friend_request',
    title: `Challenge ${action === 'accept' ? 'Accepted' : 'Rejected'}`,
    message: `${opponent?.name || 'Someone'} ${action}ed your challenge "${challenge?.title}"`,
    metadata: {
      userChallengeId: userChallenge._id.toString(),
      opponentId: userId,
      opponentName: opponent?.name || 'Unknown',
    },
  });

  return userChallenge;
};

// Get my challenges with friends
const getMyChallenges = async (userId: string, status?: string) => {
  const query: any = {
    $or: [{ challenger: userId }, { opponent: userId }],
  };

  if (status) {
    query.status = status;
  }

  const challenges = await UserChallenge.find(query)
    .populate('challenger', 'name email profilePicture level xp')
    .populate('opponent', 'name email profilePicture level xp')
    .populate('challenge')
    .sort({ createdAt: -1 });

  return challenges;
};

// Get challenge statistics
const getChallengeStats = async (userId: string): Promise<IChallengeStats> => {
  const allProgress = await ChallengeProgress.find({ user: userId });

  const totalChallenges = allProgress.length;
  const completedChallenges = allProgress.filter((p) => p.status === 'completed').length;
  const inProgressChallenges = allProgress.filter((p) => p.status === 'in_progress').length;
  const failedChallenges = allProgress.filter((p) => p.status === 'failed').length;

  // Calculate XP and coins earned from challenges
  const completedChallengeIds = allProgress.filter((p) => p.status === 'completed').map((p) => p.challenge);

  const completedChallengesData = await Challenge.find({
    _id: { $in: completedChallengeIds },
  });

  const totalXpEarned = completedChallengesData.reduce((sum, c) => sum + c.xpReward, 0);
  const totalCoinsEarned = completedChallengesData.reduce((sum, c) => sum + (c.coinsReward || 0), 0);

  const completionRate = totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0;

  return {
    totalChallenges,
    completedChallenges,
    inProgressChallenges,
    failedChallenges,
    totalXpEarned,
    totalCoinsEarned,
    completionRate: Math.round(completionRate * 10) / 10,
  };
};

// Admin: Get all challenges
const getAllChallengesAdmin = async (filters: { page: number; limit: number; status?: string; type?: string }) => {
  const { page, limit, status, type } = filters;
  const skip = (page - 1) * limit;

  const query: any = {};
  if (status) query.isActive = status === 'active';
  if (type) query.type = type;

  const [challenges, total] = await Promise.all([
    Challenge.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('createdBy', 'name email'),
    Challenge.countDocuments(query),
  ]);

  return {
    challenges,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

// Admin: Update challenge
const updateChallenge = async (challengeId: string, data: Partial<ICreateChallengeRequest>) => {
  const challenge = await Challenge.findByIdAndUpdate(challengeId, data, { new: true });

  if (!challenge) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Challenge not found');
  }

  return challenge;
};

// Admin: Delete challenge
const deleteChallenge = async (challengeId: string) => {
  const challenge = await Challenge.findByIdAndDelete(challengeId);

  if (!challenge) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Challenge not found');
  }

  // Delete associated progress
  await ChallengeProgress.deleteMany({ challenge: challengeId });
};

// Admin: Create quiz battle event
const createQuizBattle = async (data: any) => {
  const battle = await Challenge.create({
    ...data,
    type: 'multiplayer',
    isActive: true,
  });

  return battle;
};

// Admin: Get quiz battles
const getQuizBattles = async (filters: { page: number; limit: number }) => {
  const { page, limit } = filters;
  const skip = (page - 1) * limit;

  const [battles, total] = await Promise.all([
    Challenge.find({ type: 'multiplayer' }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Challenge.countDocuments({ type: 'multiplayer' }),
  ]);

  return {
    battles,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    },
  };
};

export const ChallengeService = {
  createChallenge,
  getDailyChallenge,
  getActiveChallenges,
  updateChallengeProgress,
  challengeFriend,
  respondToFriendChallenge,
  getMyChallenges,
  getChallengeStats,
  // Admin methods
  getAllChallengesAdmin,
  updateChallenge,
  deleteChallenge,
  createQuizBattle,
  getQuizBattles,
};

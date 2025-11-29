import { Types } from 'mongoose';
import { Friend } from './friend.model';
import { User } from '../auth/auth.model';
import ApiError from '../../../utils/ApiError';
import httpStatus from 'http-status';
import { IFriendRecommendation, IFriendStats } from './friend.types';
import { Notification } from '../notification/notification.model';

// Send friend request
const sendFriendRequest = async (userId: string, friendId: string) => {
  // Check if trying to add self
  if (userId === friendId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot add yourself as a friend');
  }

  // Check if friend exists
  const friendUser = await User.findById(friendId);
  if (!friendUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if friendship already exists
  const existingFriendship = await Friend.findOne({
    $or: [
      { user: userId, friend: friendId },
      { user: friendId, friend: userId },
    ],
  });

  if (existingFriendship) {
    if (existingFriendship.status === 'blocked') {
      throw new ApiError(httpStatus.FORBIDDEN, 'Cannot send friend request to this user');
    }
    if (existingFriendship.status === 'pending') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Friend request already pending');
    }
    if (existingFriendship.status === 'accepted') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Already friends with this user');
    }
  }

  // Create friend request (bidirectional entries)
  const friendRequest1 = await Friend.create({
    user: userId,
    friend: friendId,
    status: 'pending',
    requestedBy: userId,
  });

  const friendRequest2 = await Friend.create({
    user: friendId,
    friend: userId,
    status: 'pending',
    requestedBy: userId,
  });

  // Create notification
  const sender = await User.findById(userId);
  await Notification.create({
    user: friendId,
    type: 'friend_request',
    title: 'New Friend Request',
    message: `${sender?.name || 'Someone'} sent you a friend request`,
    metadata: {
      requestId: friendRequest2._id.toString(),
      senderId: userId,
      senderName: sender?.name || 'Unknown',
    },
  });

  return friendRequest1;
};

// Get friend requests (received)
const getFriendRequests = async (userId: string) => {
  const requests = await Friend.find({
    user: userId,
    status: 'pending',
    requestedBy: { $ne: userId }, // Requests where user is NOT the requester
  })
    .populate('friend', 'name email profilePicture level xp')
    .sort({ createdAt: -1 });

  return requests;
};

// Get sent friend requests
const getSentRequests = async (userId: string) => {
  const requests = await Friend.find({
    user: userId,
    status: 'pending',
    requestedBy: userId, // Requests where user IS the requester
  })
    .populate('friend', 'name email profilePicture level xp')
    .sort({ createdAt: -1 });

  return requests;
};

// Accept friend request
const acceptFriendRequest = async (userId: string, requestId: string) => {
  const request = await Friend.findById(requestId);

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Friend request not found');
  }

  if (request.user.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to accept this request');
  }

  if (request.status !== 'pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Request already processed');
  }

  // Update both entries to accepted
  await Friend.updateMany(
    {
      $or: [
        { user: request.user, friend: request.friend },
        { user: request.friend, friend: request.user },
      ],
    },
    { status: 'accepted' }
  );

  // Create notification
  const accepter = await User.findById(userId);
  await Notification.create({
    user: request.requestedBy,
    type: 'friend_request',
    title: 'Friend Request Accepted',
    message: `${accepter?.name || 'Someone'} accepted your friend request`,
    metadata: {
      friendId: userId,
      friendName: accepter?.name || 'Unknown',
    },
  });

  return await Friend.findById(requestId).populate('friend', 'name email profilePicture level xp');
};

// Reject friend request
const rejectFriendRequest = async (userId: string, requestId: string) => {
  const request = await Friend.findById(requestId);

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Friend request not found');
  }

  if (request.user.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to reject this request');
  }

  if (request.status !== 'pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Request already processed');
  }

  // Delete both friendship entries
  await Friend.deleteMany({
    $or: [
      { user: request.user, friend: request.friend },
      { user: request.friend, friend: request.user },
    ],
  });

  return { message: 'Friend request rejected' };
};

// Get all friends
const getFriends = async (userId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const friends = await Friend.find({
    user: userId,
    status: 'accepted',
  })
    .populate('friend', 'name email profilePicture level xp streak')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Friend.countDocuments({
    user: userId,
    status: 'accepted',
  });

  return {
    friends: friends.map((f) => f.friend),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Remove friend
const removeFriend = async (userId: string, friendId: string) => {
  const friendship = await Friend.findOne({
    user: userId,
    friend: friendId,
    status: 'accepted',
  });

  if (!friendship) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Friendship not found');
  }

  // Delete both friendship entries
  await Friend.deleteMany({
    $or: [
      { user: userId, friend: friendId },
      { user: friendId, friend: userId },
    ],
  });

  return { message: 'Friend removed successfully' };
};

// Block user
const blockUser = async (userId: string, blockUserId: string) => {
  if (userId === blockUserId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot block yourself');
  }

  // Check if user exists
  const userToBlock = await User.findById(blockUserId);
  if (!userToBlock) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Delete any existing friendship
  await Friend.deleteMany({
    $or: [
      { user: userId, friend: blockUserId },
      { user: blockUserId, friend: userId },
    ],
  });

  // Create blocked entry (only one-way, blocker's side)
  const blocked = await Friend.create({
    user: userId,
    friend: blockUserId,
    status: 'blocked',
    requestedBy: userId,
  });

  return blocked;
};

// Unblock user
const unblockUser = async (userId: string, blockUserId: string) => {
  const blocked = await Friend.findOne({
    user: userId,
    friend: blockUserId,
    status: 'blocked',
  });

  if (!blocked) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User is not blocked');
  }

  await Friend.deleteOne({ _id: blocked._id });

  return { message: 'User unblocked successfully' };
};

// Get blocked users
const getBlockedUsers = async (userId: string) => {
  const blocked = await Friend.find({
    user: userId,
    status: 'blocked',
  })
    .populate('friend', 'name email profilePicture')
    .sort({ createdAt: -1 });

  return blocked.map((b) => b.friend);
};

// Get friend statistics
const getFriendStats = async (userId: string): Promise<IFriendStats> => {
  const totalFriends = await Friend.countDocuments({
    user: userId,
    status: 'accepted',
  });

  const pendingRequests = await Friend.countDocuments({
    user: userId,
    status: 'pending',
    requestedBy: { $ne: userId },
  });

  const sentRequests = await Friend.countDocuments({
    user: userId,
    status: 'pending',
    requestedBy: userId,
  });

  return {
    totalFriends,
    pendingRequests,
    sentRequests,
  };
};

// Get friend recommendations
const getFriendRecommendations = async (userId: string, limit = 10): Promise<IFriendRecommendation[]> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Get user's friends
  const userFriends = await Friend.find({
    user: userId,
    status: 'accepted',
  }).select('friend');

  const friendIds = userFriends.map((f) => f.friend);

  // Get blocked users
  const blockedUsers = await Friend.find({
    user: userId,
    status: 'blocked',
  }).select('friend');

  const blockedIds = blockedUsers.map((b) => b.friend);

  // Get pending requests (both sent and received)
  const pendingRequests = await Friend.find({
    $or: [{ user: userId }, { friend: userId }],
    status: 'pending',
  });

  const pendingUserIds = pendingRequests.map((p) => (p.user.toString() === userId ? p.friend : p.user));

  // Find users with similar interests
  const recommendations = await User.aggregate([
    {
      $match: {
        _id: {
          $nin: [...friendIds, ...blockedIds, ...pendingUserIds, new Types.ObjectId(userId)],
        },
        'preferences.interests': {
          $in: user.preferences?.interests || [],
        },
      },
    },
    {
      $addFields: {
        similarInterests: {
          $size: {
            $setIntersection: ['$preferences.interests', user.preferences?.interests || []],
          },
        },
      },
    },
    {
      $match: {
        similarInterests: { $gt: 0 },
      },
    },
    {
      $lookup: {
        from: 'friends',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $in: ['$friend', friendIds] }, { $eq: ['$user', '$$userId'] }, { $eq: ['$status', 'accepted'] }],
              },
            },
          },
        ],
        as: 'mutualFriends',
      },
    },
    {
      $addFields: {
        mutualFriendsCount: { $size: '$mutualFriends' },
      },
    },
    {
      $sort: {
        mutualFriendsCount: -1,
        similarInterests: -1,
        xp: -1,
      },
    },
    {
      $limit: limit,
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        profilePicture: 1,
        level: 1,
        xp: 1,
        'preferences.interests': 1,
        mutualFriendsCount: 1,
        similarInterests: 1,
      },
    },
  ]);

  return recommendations.map((rec) => ({
    user: {
      _id: rec._id.toString(),
      name: rec.name,
      email: rec.email,
      profilePicture: rec.profilePicture,
      level: rec.level,
      xp: rec.xp,
    },
    mutualFriends: rec.mutualFriendsCount,
    similarInterests: rec.preferences?.interests || [],
    reason:
      rec.mutualFriendsCount > 0
        ? `${rec.mutualFriendsCount} mutual friend${rec.mutualFriendsCount > 1 ? 's' : ''}`
        : `${rec.similarInterests} similar interest${rec.similarInterests > 1 ? 's' : ''}`,
  }));
};

export const FriendService = {
  sendFriendRequest,
  getFriendRequests,
  getSentRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  removeFriend,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getFriendStats,
  getFriendRecommendations,
};

import {
  Group,
  Post,
  ForumComment,
  PostLike,
  CommentLike,
  PostView,
  GroupMember,
  GroupInvitation,
  Poll,
  ReportPost,
  ReportComment,
} from './forum.model';
import {
  ICreateGroupRequest,
  ICreatePostRequest,
  ICreateCommentRequest,
  IForumSearchQuery,
  IPostSearchQuery,
  IForumStats,
  IGroupStats,
  ICreatePollRequest,
  IReportRequest,
  } from './forum.types';
import ApiError from '../../../utils/ApiError';
import httpStatus from 'http-status';
import Notification from '../notification/notification.model';
import User from '../auth/auth.model';/**
 * ========================================
 * GROUP SERVICES
 * ========================================
 */

/**
 * Create Group
 */
export const createGroup = async (userId: string, data: ICreateGroupRequest) => {
  const group = await Group.create({
    ...data,
    creator: userId,
    moderators: [userId],
    members: [userId],
    memberCount: 1,
  });

  // Create group membership
  await GroupMember.create({
    group: group._id,
    user: userId,
    role: 'admin',
    joinedAt: new Date(),
  });

  return group;
};

/**
 * Get Groups (with search and filters)
 */
export const getGroups = async (filters: IForumSearchQuery) => {
  const {
    query,
    category,
    tags,
    privacy,
    sortBy = 'popular',
    page = 1,
    limit = 20,
  } = filters;

  const filter: any = { isActive: true };

  if (query) {
    filter.$text = { $search: query };
  }
  if (category) {
    filter.category = category;
  }
  if (tags && tags.length > 0) {
    filter.tags = { $in: tags };
  }
  if (privacy) {
    filter.privacy = privacy;
  }

  let sort: any = {};
  switch (sortBy) {
    case 'popular':
      sort = { memberCount: -1, postCount: -1 };
      break;
    case 'members':
      sort = { memberCount: -1 };
      break;
    case 'posts':
      sort = { postCount: -1 };
      break;
    case 'recent':
    default:
      sort = { createdAt: -1 };
  }

  const groups = await Group.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('creator', 'name email profilePicture')
    .select('-members'); // Don't send full member arrays

  const total = await Group.countDocuments(filter);

  return {
    groups,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

/**
 * Get Group Details
 */
export const getGroupDetails = async (groupId: string, userId?: string) => {
  const group = await Group.findById(groupId)
    .populate('creator', 'name email profilePicture')
    .populate('moderators', 'name email profilePicture');

  if (!group) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Group not found');
  }

  // Check if user is a member
  let isMember = false;
  let userRole = null;

  if (userId) {
    const membership = await GroupMember.findOne({ group: groupId, user: userId });
    if (membership) {
      isMember = true;
      userRole = membership.role;
    }
  }

  return {
    ...group.toObject(),
    isMember,
    userRole,
  };
};

/**
 * Update Group
 */
export const updateGroup = async (
  groupId: string,
  userId: string,
  data: Partial<ICreateGroupRequest>
) => {
  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Group not found');
  }

  // Check if user is admin or moderator
  const membership = await GroupMember.findOne({ group: groupId, user: userId });
  if (!membership || !['admin', 'moderator'].includes(membership.role)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only admins and moderators can update group');
  }

  Object.assign(group, data);
  await group.save();

  return group;
};

/**
 * Delete Group
 */
export const deleteGroup = async (groupId: string, userId: string) => {
  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Group not found');
  }

  // Only creator can delete
  if (group.creator.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only group creator can delete the group');
  }

  // Delete related data
  await Promise.all([
    Post.deleteMany({ group: groupId }),
    GroupMember.deleteMany({ group: groupId }),
    GroupInvitation.deleteMany({ group: groupId }),
  ]);

  await group.deleteOne();

  return { message: 'Group deleted successfully' };
};

/**
 * Join Group
 */
export const joinGroup = async (groupId: string, userId: string) => {
  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Group not found');
  }

  // Check if already a member
  const existingMember = await GroupMember.findOne({ group: groupId, user: userId });
  if (existingMember) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You are already a member of this group');
  }

  // For private groups, need invitation
  if (group.privacy === 'private') {
    const invitation = await GroupInvitation.findOne({
      group: groupId,
      invitedUser: userId,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });

    if (!invitation) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You need an invitation to join this private group');
    }

    invitation.status = 'accepted';
    await invitation.save();
  }

  // Add member
  await GroupMember.create({
    group: groupId,
    user: userId,
    role: 'member',
    joinedAt: new Date(),
  });

  // Update group
  group.members.push(userId as any);
  group.memberCount += 1;
  await group.save();

  return { message: 'Successfully joined the group' };
};

/**
 * Leave Group
 */
export const leaveGroup = async (groupId: string, userId: string) => {
  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Group not found');
  }

  // Can't leave if creator
  if (group.creator.toString() === userId.toString()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Group creator cannot leave. Transfer ownership or delete the group.');
  }

  const membership = await GroupMember.findOne({ group: groupId, user: userId });
  if (!membership) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You are not a member of this group');
  }

  // Remove membership
  await membership.deleteOne();

  // Update group
  group.members = group.members.filter((m) => m.toString() !== userId.toString());
  group.moderators = group.moderators.filter((m) => m.toString() !== userId.toString());
  group.memberCount = Math.max(0, group.memberCount - 1);
  await group.save();

  return { message: 'Successfully left the group' };
};

/**
 * Invite User to Group
 */
export const inviteUser = async (
  groupId: string,
  inviterId: string,
  invitedUserId: string
) => {
  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Group not found');
  }

  // Check if inviter is member
  const inviterMembership = await GroupMember.findOne({ group: groupId, user: inviterId });
  if (!inviterMembership) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only group members can invite others');
  }

  // Check if already invited
  const existingInvitation = await GroupInvitation.findOne({
    group: groupId,
    invitedUser: invitedUserId,
    status: 'pending',
  });

  if (existingInvitation) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already has a pending invitation');
  }

  // Create invitation
  const invitation = await GroupInvitation.create({
    group: groupId,
    invitedBy: inviterId,
    invitedUser: invitedUserId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  return invitation;
};

/**
 * Get User's Invitations
 */
export const getUserInvitations = async (userId: string) => {
  const invitations = await GroupInvitation.find({
    invitedUser: userId,
    status: 'pending',
    expiresAt: { $gt: new Date() },
  })
    .populate('group', 'name description category coverImage')
    .populate('invitedBy', 'name email profilePicture')
    .sort({ createdAt: -1 });

  return invitations;
};

/**
 * Respond to Invitation
 */
export const respondToInvitation = async (
  invitationId: string,
  userId: string,
  accept: boolean
) => {
  const invitation = await GroupInvitation.findById(invitationId);
  if (!invitation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invitation not found');
  }

  if (invitation.invitedUser.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'This invitation is not for you');
  }

  if (invitation.status !== 'pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invitation already responded to');
  }

  if (invitation.expiresAt < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invitation has expired');
  }

  invitation.status = accept ? 'accepted' : 'rejected';
  await invitation.save();

  if (accept) {
    await joinGroup(invitation.group.toString(), userId);
  }

  return { message: accept ? 'Invitation accepted' : 'Invitation rejected' };
};

/**
 * Get Group Members
 */
export const getGroupMembers = async (groupId: string, page: number = 1, limit: number = 50) => {
  const members = await GroupMember.find({ group: groupId })
    .populate('user', 'name email profilePicture xp level')
    .sort({ role: 1, joinedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await GroupMember.countDocuments({ group: groupId });

  return {
    members,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

/**
 * Update Member Role
 */
export const updateMemberRole = async (
  groupId: string,
  userId: string,
  targetUserId: string,
  role: 'member' | 'moderator' | 'admin'
) => {
  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Group not found');
  }

  // Only admin can change roles
  const userMembership = await GroupMember.findOne({ group: groupId, user: userId });
  if (!userMembership || userMembership.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only admins can change member roles');
  }

  const targetMembership = await GroupMember.findOne({ group: groupId, user: targetUserId });
  if (!targetMembership) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Target user is not a member');
  }

  targetMembership.role = role;
  await targetMembership.save();

  // Update group moderators array
  if (role === 'moderator' || role === 'admin') {
    if (!group.moderators.some((m) => m.toString() === targetUserId)) {
      group.moderators.push(targetUserId as any);
    }
  } else {
    group.moderators = group.moderators.filter((m) => m.toString() !== targetUserId);
  }

  await group.save();

  return { message: 'Member role updated successfully' };
};

/**
 * Get Group Statistics
 */
export const getGroupStats = async (groupId: string): Promise<IGroupStats> => {
  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Group not found');
  }

  const totalComments = await ForumComment.countDocuments({
    post: { $in: await Post.find({ group: groupId }).distinct('_id') },
  });

  // Active members (posted or commented in last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const activePosts = await Post.find({
    group: groupId,
    createdAt: { $gte: thirtyDaysAgo },
  }).distinct('author');

  const stats: IGroupStats = {
    memberCount: group.memberCount,
    postCount: group.postCount,
    commentCount: totalComments,
    activeMembers: activePosts.length,
    topContributors: [],
    recentActivity: {
      posts: await Post.countDocuments({ group: groupId, createdAt: { $gte: thirtyDaysAgo } }),
      comments: await ForumComment.countDocuments({
        post: { $in: await Post.find({ group: groupId }).distinct('_id') },
        createdAt: { $gte: thirtyDaysAgo },
      }),
      newMembers: await GroupMember.countDocuments({
        group: groupId,
        joinedAt: { $gte: thirtyDaysAgo },
      }),
    },
  };

  return stats;
};

/**
 * ========================================
 * POST SERVICES
 * ========================================
 */

/**
 * Create Post
 */
export const createPost = async (userId: string, data: ICreatePostRequest) => {
  const { groupId, ...postData } = data;

  // Check if user is member
  const membership = await GroupMember.findOne({ group: groupId, user: userId });
  if (!membership) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You must be a group member to post');
  }

  const post = await Post.create({
    ...postData,
    group: groupId,
    author: userId,
  });

  // Update group post count
  await Group.findByIdAndUpdate(groupId, { $inc: { postCount: 1 } });

  return post;
};

/**
 * Get Posts (with search and filters)
 */
export const getPosts = async (filters: IPostSearchQuery) => {
  const {
    query,
    groupId,
    contentType,
    tags,
    authorId,
    sortBy = 'recent',
    page = 1,
    limit = 20,
  } = filters;

  const filter: any = {};

  if (query) {
    filter.$text = { $search: query };
  }
  if (groupId) {
    filter.group = groupId;
  }
  if (contentType) {
    filter.contentType = contentType;
  }
  if (tags && tags.length > 0) {
    filter.tags = { $in: tags };
  }
  if (authorId) {
    filter.author = authorId;
  }

  let sort: any = {};
  switch (sortBy) {
    case 'popular':
      sort = { likeCount: -1, commentCount: -1 };
      break;
    case 'mostCommented':
      sort = { commentCount: -1 };
      break;
    case 'unanswered':
      filter.contentType = 'question';
      filter.commentCount = 0;
      sort = { createdAt: -1 };
      break;
    case 'recent':
    default:
      sort = { isPinned: -1, createdAt: -1 };
  }

  const posts = await Post.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'name email profilePicture level')
    .populate('group', 'name category');

  const total = await Post.countDocuments(filter);

  return {
    posts,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

/**
 * Get Post Details
 */
export const getPostDetails = async (postId: string, userId?: string) => {
  const post = await Post.findById(postId)
    .populate('author', 'name email profilePicture level xp')
    .populate('group', 'name category');

  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  // Track unique view - only increment if this user hasn't viewed before
  if (userId) {
    try {
      // Try to create a new view record (will fail if already exists due to unique index)
      await PostView.create({ post: postId, user: userId });
      // If successful, increment view count
      post.viewCount += 1;
      await post.save();
    } catch (error: any) {
      // If error code 11000, it means duplicate (user already viewed)
      // Don't increment view count, just continue
      if (error.code !== 11000) {
        // If it's a different error, log it
        console.error('Error tracking post view:', error);
      }
    }
  } else {
    // For non-logged in users, increment every time (can't track unique views)
    post.viewCount += 1;
    await post.save();
  }

  // Check if user liked
  let isLiked = false;
  if (userId) {
    const like = await PostLike.findOne({ post: postId, user: userId });
    isLiked = !!like;
  }

  return {
    ...post.toObject(),
    isLiked,
  };
};

/**
 * Update Post
 */
export const updatePost = async (
  postId: string,
  userId: string,
  data: Partial<ICreatePostRequest>
) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (post.author.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only edit your own posts');
  }

  if (post.isLocked) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This post is locked and cannot be edited');
  }

  Object.assign(post, data);
  await post.save();

  return post;
};

/**
 * Delete Post
 */
export const deletePost = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  // Author or moderator can delete
  const membership = await GroupMember.findOne({ group: post.group, user: userId });
  const isAuthor = post.author.toString() === userId.toString();
  const isModerator = membership && ['admin', 'moderator'].includes(membership.role);

  if (!isAuthor && !isModerator) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only post author or moderators can delete posts');
  }

  // Delete related data
  await Promise.all([
    ForumComment.deleteMany({ post: postId }),
    PostLike.deleteMany({ post: postId }),
    Poll.deleteOne({ post: postId }),
  ]);

  await post.deleteOne();

  // Update group post count
  await Group.findByIdAndUpdate(post.group, { $inc: { postCount: -1 } });

  return { message: 'Post deleted successfully' };
};

/**
 * Like/Unlike Post
 */
export const togglePostLike = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  const existingLike = await PostLike.findOne({ post: postId, user: userId });

  if (existingLike) {
    // Unlike
    await existingLike.deleteOne();
    post.likeCount = Math.max(0, post.likeCount - 1);
    await post.save();
    return { liked: false, likeCount: post.likeCount };
  } else {
    // Like
    await PostLike.create({ post: postId, user: userId });
    post.likeCount += 1;
    await post.save();

    // Send real-time notification to post author
    const postWithAuthor = await Post.findById(postId).populate('author', '_id name profilePicture');
    const userWhoLiked = await User.findById(userId).select('name profilePicture');
    
    if (postWithAuthor && userWhoLiked && postWithAuthor.author._id.toString() !== userId) {
      await Notification.create({
        user: (postWithAuthor.author as any)._id,
        type: 'like',
        title: 'New Like on Your Post',
        message: `${userWhoLiked.name} liked your post "${postWithAuthor.title}"`,
        data: {
          postId: postId,
          userId: userId,
          senderName: userWhoLiked.name,
          senderImage: userWhoLiked.profilePicture,
          link: `/forum/${postId}`,
        },
      });
      console.log('✅ Like notification created for user:', (postWithAuthor.author as any)._id);
    }

    return { liked: true, likeCount: post.likeCount };
  }
};

/**
 * Pin/Unpin Post (Moderators only)
 */
export const togglePinPost = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  // Check moderator status
  const membership = await GroupMember.findOne({ group: post.group, user: userId });
  if (!membership || !['admin', 'moderator'].includes(membership.role)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only moderators can pin posts');
  }

  post.isPinned = !post.isPinned;
  await post.save();

  return { isPinned: post.isPinned };
};

/**
 * Lock/Unlock Post (Moderators only)
 */
export const toggleLockPost = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  // Check moderator status
  const membership = await GroupMember.findOne({ group: post.group, user: userId });
  if (!membership || !['admin', 'moderator'].includes(membership.role)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only moderators can lock posts');
  }

  post.isLocked = !post.isLocked;
  await post.save();

  return { isLocked: post.isLocked };
};

/**
 * ========================================
 * COMMENT SERVICES
 * ========================================
 */

/**
 * Create Comment
 */
export const createComment = async (userId: string, data: ICreateCommentRequest) => {
  const { postId, parentCommentId, content } = data;

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (post.isLocked) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This post is locked. No new comments allowed.');
  }

  // Check if user is group member
  const membership = await GroupMember.findOne({ group: post.group, user: userId });
  if (!membership) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You must be a group member to comment');
  }

  // If parent comment, verify it exists
  if (parentCommentId) {
    const parentComment = await ForumComment.findById(parentCommentId);
    if (!parentComment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Parent comment not found');
    }
  }

  const comment = await ForumComment.create({
    post: postId,
    author: userId,
    content,
    parentComment: parentCommentId || undefined,
  });

  // Update post comment count
  post.commentCount += 1;
  await post.save();

  // Populate author details for notification
  await comment.populate('author', 'name profilePicture');
  await post.populate('author', 'name');

  // Send real-time notification
  if (parentCommentId) {
    // Reply to comment - notify parent comment author
    const parentComment = await ForumComment.findById(parentCommentId).populate('author', '_id name');
    if (parentComment && parentComment.author._id.toString() !== userId) {
      await Notification.create({
        user: parentComment.author._id,
        type: 'reply',
        title: 'New Reply to Your Comment',
        message: `${(comment.author as any).name} replied: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
        data: {
          postId: postId,
          commentId: parentCommentId,
          userId: userId,
          senderName: (comment.author as any).name,
          senderImage: (comment.author as any).profilePicture,
          link: `/forum/${postId}`,
        },
      });
    }
  } else {
    // New comment on post - notify post author
    if ((post.author as any)._id.toString() !== userId) {
      await Notification.create({
        user: (post.author as any)._id,
        type: 'comment',
        title: 'New Comment on Your Post',
        message: `${(comment.author as any).name} commented: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
        data: {
          postId: postId,
          userId: userId,
          senderName: (comment.author as any).name,
          senderImage: (comment.author as any).profilePicture,
          link: `/forum/${postId}`,
        },
      });
    }
  }

  return comment;
};

/**
 * Helper function to recursively fetch nested replies
 */
const fetchNestedReplies = async (commentId: any): Promise<any[]> => {
  const replies = await ForumComment.find({ parentComment: commentId })
    .sort({ createdAt: 1 })
    .populate('author', 'name email profilePicture level xp')
    .lean();

  // Recursively fetch replies for each reply
  const repliesWithNestedReplies = await Promise.all(
    replies.map(async (reply) => {
      const nestedReplies = await fetchNestedReplies(reply._id);
      return {
        ...reply,
        replies: nestedReplies,
        replyCount: nestedReplies.length,
      };
    })
  );

  return repliesWithNestedReplies;
};

/**
 * Get Comments for Post
 */
export const getComments = async (postId: string, page: number = 1, limit: number = 50) => {
  // Get top-level comments only
  const comments = await ForumComment.find({ post: postId, parentComment: { $exists: false } })
    .sort({ isAcceptedAnswer: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'name email profilePicture level xp');

  const total = await ForumComment.countDocuments({ post: postId, parentComment: { $exists: false } });

  // Get all nested replies recursively for each comment
  const commentsWithReplies = await Promise.all(
    comments.map(async (comment) => {
      const replies = await fetchNestedReplies(comment._id);
      const totalReplyCount = await ForumComment.countDocuments({ parentComment: comment._id });

      return {
        ...comment.toObject(),
        replies,
        replyCount: totalReplyCount,
      };
    })
  );

  return {
    comments: commentsWithReplies,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

/**
 * Update Comment
 */
export const updateComment = async (
  commentId: string,
  userId: string,
  content: string
) => {
  const comment = await ForumComment.findById(commentId);
  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  if (comment.author.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only edit your own comments');
  }

  comment.content = content;
  await comment.save();

  return comment;
};

/**
 * Delete Comment
 */
export const deleteComment = async (commentId: string, userId: string) => {
  const comment = await ForumComment.findById(commentId);
  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const post = await Post.findById(comment.post);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Associated post not found');
  }

  // Author or moderator can delete
  const membership = await GroupMember.findOne({ group: post.group, user: userId });
  const isAuthor = comment.author.toString() === userId.toString();
  const isModerator = membership && ['admin', 'moderator'].includes(membership.role);

  if (!isAuthor && !isModerator) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only comment author or moderators can delete comments');
  }

  // Delete replies first
  await ForumComment.deleteMany({ parentComment: commentId });
  await CommentLike.deleteMany({ comment: commentId });
  await comment.deleteOne();

  // Update post comment count
  post.commentCount = Math.max(0, post.commentCount - 1);
  await post.save();

  return { message: 'Comment deleted successfully' };
};

/**
 * Like/Unlike Comment
 */
export const toggleCommentLike = async (commentId: string, userId: string) => {
  const comment = await ForumComment.findById(commentId).populate('author', 'name profilePicture');
  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const existingLike = await CommentLike.findOne({ comment: commentId, user: userId });

  if (existingLike) {
    // Unlike
    await existingLike.deleteOne();
    comment.likeCount = Math.max(0, comment.likeCount - 1);
    await comment.save();
    return { liked: false, likeCount: comment.likeCount };
  } else {
    // Like
    await CommentLike.create({ comment: commentId, user: userId });
    comment.likeCount += 1;
    await comment.save();

    // Create notification for comment author (if not self-like)
    const userWhoLiked = await User.findById(userId).select('name profilePicture');
    if (comment.author && userWhoLiked && (comment.author as any)._id.toString() !== userId) {
      const commentSnippet = comment.content.substring(0, 50) + (comment.content.length > 50 ? '...' : '');
      
      await Notification.create({
        user: (comment.author as any)._id,
        type: 'like',
        title: 'New Like on Your Comment',
        message: `${userWhoLiked.name} liked your comment: "${commentSnippet}"`,
        data: { 
          commentId, 
          userId, 
          senderName: userWhoLiked.name, 
          senderImage: userWhoLiked.profilePicture, 
          link: `/forum/${comment.post}` 
        },
      });
      console.log('✅ Comment like notification created for user:', (comment.author as any)._id);
    }

    return { liked: true, likeCount: comment.likeCount };
  }
};

/**
 * Accept Answer (multiple answers can be accepted)
 */
export const acceptAnswer = async (commentId: string, userId: string) => {
  const comment = await ForumComment.findById(commentId);
  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const post = await Post.findById(comment.post);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (post.author.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only post author can accept answers');
  }

  // Toggle accepted status - allow multiple answers to be accepted
  comment.isAcceptedAnswer = !comment.isAcceptedAnswer;
  await comment.save();

  // Send real-time notification if answer was accepted (not unaccepted)
  if (comment.isAcceptedAnswer) {
    await comment.populate('author', '_id name profilePicture');
    await post.populate('author', 'name profilePicture');
    
    if ((comment.author as any)._id.toString() !== userId) {
      await Notification.create({
        user: (comment.author as any)._id,
        type: 'accept_answer',
        title: '✅ Your Answer Was Accepted!',
        message: `${(post.author as any).name} accepted your answer on "${post.title}"`,
        data: {
          postId: post._id.toString(),
          commentId: comment._id.toString(),
          userId: userId,
          senderName: (post.author as any).name,
          senderImage: (post.author as any).profilePicture,
          link: `/forum/${post._id}`,
        },
      });
    }
  }

  return { 
    message: comment.isAcceptedAnswer ? 'Answer accepted successfully' : 'Answer unaccepted successfully', 
    isAccepted: comment.isAcceptedAnswer 
  };
};

/**
 * ========================================
 * POLL SERVICES
 * ========================================
 */

/**
 * Create Poll
 */
export const createPoll = async (userId: string, data: ICreatePollRequest) => {
  const { postId, question, options, multipleChoice, expiresAt } = data;

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (post.author.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only post author can create a poll');
  }

  if (post.contentType !== 'poll') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Post must be of type "poll"');
  }

  // Check if poll already exists
  const existingPoll = await Poll.findOne({ post: postId });
  if (existingPoll) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Poll already exists for this post');
  }

  const pollOptions = options.map((option) => ({
    option,
    votes: 0,
    voters: [],
  }));

  const poll = await Poll.create({
    post: postId,
    question,
    options: pollOptions,
    multipleChoice: multipleChoice || false,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
  });

  return poll;
};

/**
 * Vote on Poll
 */
export const votePoll = async (pollId: string, userId: string, optionIndex: number) => {
  const poll = await Poll.findById(pollId);
  if (!poll) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Poll not found');
  }

  if (poll.expiresAt && poll.expiresAt < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Poll has expired');
  }

  if (optionIndex < 0 || optionIndex >= poll.options.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid option index');
  }

  const option = poll.options[optionIndex];

  // Check if user already voted
  const hasVoted = poll.options.some((opt) =>
    opt.voters.some((voter) => voter.toString() === userId.toString())
  );

  if (hasVoted && !poll.multipleChoice) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You have already voted on this poll');
  }

  // Check if already voted for this specific option
  const alreadyVotedThisOption = option.voters.some(
    (voter) => voter.toString() === userId.toString()
  );

  if (alreadyVotedThisOption) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You have already voted for this option');
  }

  // Add vote
  option.votes += 1;
  option.voters.push(userId as any);

  await poll.save();

  return poll;
};

/**
 * Get Poll Results
 */
export const getPollResults = async (pollId: string) => {
  const poll = await Poll.findById(pollId).populate('post', 'title author');

  if (!poll) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Poll not found');
  }

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  const results = poll.options.map((opt) => ({
    option: opt.option,
    votes: opt.votes,
    percentage: totalVotes > 0 ? ((opt.votes / totalVotes) * 100).toFixed(2) : '0.00',
  }));

  return {
    question: poll.question,
    totalVotes,
    results,
    expiresAt: poll.expiresAt,
    isExpired: poll.expiresAt ? poll.expiresAt < new Date() : false,
  };
};

/**
 * ========================================
 * MODERATION SERVICES
 * ========================================
 */

/**
 * Report Post
 */
export const reportPost = async (
  postId: string,
  userId: string,
  data: IReportRequest
) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  const report = await ReportPost.create({
    post: postId,
    reportedBy: userId,
    reason: data.reason,
    description: data.description,
  });

  return report;
};

/**
 * Report Comment
 */
export const reportComment = async (
  commentId: string,
  userId: string,
  data: IReportRequest
) => {
  const comment = await ForumComment.findById(commentId);
  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const report = await ReportComment.create({
    comment: commentId,
    reportedBy: userId,
    reason: data.reason,
    description: data.description,
  });

  return report;
};

/**
 * Get Forum Statistics
 */
export const getForumStats = async (): Promise<IForumStats> => {
  const totalGroups = await Group.countDocuments({ isActive: true });
  const totalPosts = await Post.countDocuments();
  const totalComments = await ForumComment.countDocuments();
  const totalMembers = await GroupMember.countDocuments();
  const activeGroups = await Group.countDocuments({
    isActive: true,
    postCount: { $gt: 0 },
  });

  const popularGroups = await Group.find({ isActive: true })
    .sort({ memberCount: -1, postCount: -1 })
    .limit(10)
    .select('name description category memberCount postCount coverImage');

  const recentPosts = await Post.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('author', 'name profilePicture')
    .populate('group', 'name');

  // Get trending tags
  const tagAggregation = await Post.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
    { $project: { tag: '$_id', count: 1, _id: 0 } },
  ]);

  return {
    totalGroups,
    totalPosts,
    totalComments,
    totalMembers,
    activeGroups,
    popularGroups,
    recentPosts,
    trendingTags: tagAggregation,
  };
};

/**
 * Vote on Post (Upvote/Downvote)
 */
export const votePost = async (postId: string, userId: string, voteType: 'upvote' | 'downvote') => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  const upvoteIndex = post.upvotes.indexOf(userId as any);
  const downvoteIndex = post.downvotes.indexOf(userId as any);

  if (voteType === 'upvote') {
    if (upvoteIndex > -1) {
      // Remove upvote
      post.upvotes.splice(upvoteIndex, 1);
    } else {
      // Add upvote, remove downvote if exists
      if (downvoteIndex > -1) {
        post.downvotes.splice(downvoteIndex, 1);
      }
      post.upvotes.push(userId as any);
    }
  } else {
    if (downvoteIndex > -1) {
      // Remove downvote
      post.downvotes.splice(downvoteIndex, 1);
    } else {
      // Add downvote, remove upvote if exists
      if (upvoteIndex > -1) {
        post.upvotes.splice(upvoteIndex, 1);
      }
      post.downvotes.push(userId as any);
    }
  }

  await post.save();

  return {
    upvotes: post.upvotes.length,
    downvotes: post.downvotes.length,
    userVote: upvoteIndex > -1 || (voteType === 'upvote' && upvoteIndex === -1) ? 'upvote' : 
              downvoteIndex > -1 || (voteType === 'downvote' && downvoteIndex === -1) ? 'downvote' : null,
  };
};

/**
 * Vote on Comment (Upvote/Downvote)
 */
export const voteComment = async (commentId: string, userId: string, voteType: 'upvote' | 'downvote') => {
  const comment = await ForumComment.findById(commentId);
  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const upvoteIndex = comment.upvotes.indexOf(userId as any);
  const downvoteIndex = comment.downvotes.indexOf(userId as any);

  if (voteType === 'upvote') {
    if (upvoteIndex > -1) {
      comment.upvotes.splice(upvoteIndex, 1);
    } else {
      if (downvoteIndex > -1) {
        comment.downvotes.splice(downvoteIndex, 1);
      }
      comment.upvotes.push(userId as any);
      
      // Award XP for helpful answer
      const User = require('../auth/auth.model').default;
      await User.findByIdAndUpdate(comment.author, { $inc: { xp: 5 } });
    }
  } else {
    if (downvoteIndex > -1) {
      comment.downvotes.splice(downvoteIndex, 1);
    } else {
      if (upvoteIndex > -1) {
        comment.upvotes.splice(upvoteIndex, 1);
      }
      comment.downvotes.push(userId as any);
    }
  }

  comment.likeCount = comment.upvotes.length;
  await comment.save();

  return {
    upvotes: comment.upvotes.length,
    downvotes: comment.downvotes.length,
  };
};

/**
 * Mark Best Answer
 */
export const markBestAnswer = async (postId: string, commentId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  // Only post author can mark best answer
  if (post.author.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only post author can mark best answer');
  }

  const comment = await ForumComment.findById(commentId);
  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  // Remove previous best answer
  if (post.bestAnswer) {
    await ForumComment.findByIdAndUpdate(post.bestAnswer, { isAcceptedAnswer: false });
  }

  // Set new best answer
  post.bestAnswer = commentId as any;
  post.isSolved = true;
  await post.save();

  comment.isAcceptedAnswer = true;
  await comment.save();

  // Award XP and badge to answer author
  const User = require('../auth/auth.model').default;
  await User.findByIdAndUpdate(comment.author, { $inc: { xp: 50 } });

  return post;
};

/**
 * Mark Post as Solved
 */
export const markPostSolved = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (post.author.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only post author can mark as solved');
  }

  post.isSolved = !post.isSolved;
  await post.save();

  return post;
};



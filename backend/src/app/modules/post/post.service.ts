import { Types } from 'mongoose';
import { Post as FeedPost } from './post.model';
import { Friend } from '../friend/friend.model';
import ApiError from '../../../utils/ApiError';
import httpStatus from 'http-status';
import { CacheService } from '../../../utils/cache.service';

// Create post
const createPost = async (userId: string, postData: any) => {
  // Validate that at least one content type exists
  if (!postData.content && (!postData.images || postData.images.length === 0) && !postData.video) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Post must have at least content, images, or video');
  }

  // Set defaults
  const postToCreate = {
    user: userId,
    content: postData.content || '',
    type: postData.type || 'text',
    visibility: postData.visibility || 'public',
    ...postData,
  };


  try {
    const post = await FeedPost.create(postToCreate);

    const populatedPost = await FeedPost.findById(post._id)
      .populate('user', 'name email profilePicture level xp')
      .populate('sharedPost')
      .populate({
        path: 'sharedPost',
        populate: { path: 'user', select: 'name email profilePicture level' },
      });

    // Invalidate feed cache after new post
    if (postToCreate.visibility === 'public') {
      await CacheService.invalidatePattern('feed:public:*');
    }

    return populatedPost;
  } catch (error: any) {
    console.error('❌ Post creation failed!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.errors) {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    throw error;
  }
};

// Get feed posts (public posts + friends' posts + own posts)
const getFeedPosts = async (userId: string, page = 1, limit = 10) => {
  try {
    const cacheKey = `feed:${userId}:${page}:${limit}`;

    // Try to fetch from cache first
    try {
      const cachedFeed = await CacheService.get(cacheKey);
      if (cachedFeed) {
        return cachedFeed;
      }
    } catch (cacheError) {
      console.warn('Cache fetch failed, continuing without cache:', cacheError);
    }

    const skip = (page - 1) * limit;

    // Get user's friends to determine "friends" visibility eligibility
    let friendIds: any[] = [];
    try {
      const friends = await Friend.find({
        user: userId,
        status: 'accepted',
      }).select('friend');
      friendIds = friends.map((f) => f.friend);
    } catch (friendError) {
      console.warn('Friend lookup failed, showing only public posts:', friendError);
    }

    const query = {
      $or: [
        { visibility: 'public' },
        { visibility: 'friends', user: { $in: friendIds } },
        { user: userId },
      ],
    };

    // Performance Optimization: Use lean() for read-only query
    const posts = await FeedPost.find(query)
      .populate('user', 'name email profilePicture level xp streak')
      .populate('sharedPost')
      .populate({
        path: 'sharedPost',
        populate: { path: 'user', select: 'name email profilePicture level' },
      })
      .populate('comments.user', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await FeedPost.countDocuments(query);

    const result = {
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache the result for 1 minute (feed updates frequently)
    try {
      await CacheService.set(cacheKey, result, 60);
    } catch (cacheError) {
      console.warn('Cache set failed:', cacheError);
    }

    return result;
  } catch (error) {
    console.error('getFeedPosts error:', error);
    throw error;
  }
};

// Get user posts
const getUserPosts = async (userId: string, viewerId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // Check if viewer can see posts
  let visibilityFilter: any = { visibility: 'public' };

  if (userId === viewerId) {
    // Own profile - show all
    visibilityFilter = {};
  } else {
    // Check if friends
    const friendship = await Friend.findOne({
      user: viewerId,
      friend: userId,
      status: 'accepted',
    });

    if (friendship) {
      visibilityFilter = { visibility: { $in: ['public', 'friends'] } };
    }
  }

  const posts = await FeedPost.find({
    user: userId,
    ...visibilityFilter,
  })
    .populate('user', 'name email profilePicture level xp streak')
    .populate('sharedPost')
    .populate({
      path: 'sharedPost',
      populate: { path: 'user', select: 'name email profilePicture level' },
    })
    .populate('comments.user', 'name email profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await FeedPost.countDocuments({
    user: userId,
    ...visibilityFilter,
  });

  return {
    posts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get single post
const getPostById = async (postId: string) => {
  const post = await FeedPost.findById(postId)
    .populate('user', 'name email profilePicture level xp streak')
    .populate('sharedPost')
    .populate({
      path: 'sharedPost',
      populate: { path: 'user', select: 'name email profilePicture level' },
    })
    .populate('comments.user', 'name email profilePicture');

  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  return post;
};

// Update post
const updatePost = async (userId: string, postId: string, updateData: any) => {
  const post = await FeedPost.findById(postId);

  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (post.user.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to update this post');
  }

  post.content = updateData.content || post.content;
  post.images = updateData.images || post.images;
  post.video = updateData.video || post.video;
  post.visibility = updateData.visibility || post.visibility;
  post.isEdited = true;

  await post.save();

  return await FeedPost.findById(postId)
    .populate('user', 'name email profilePicture level xp')
    .populate('comments.user', 'name email profilePicture');
};

// Delete post
const deletePost = async (userId: string, postId: string) => {
  const post = await FeedPost.findById(postId);

  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (post.user.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to delete this post');
  }

  await FeedPost.deleteOne({ _id: postId });

  // Invalidate feed caches
  await CacheService.invalidatePattern('feed:*');

  return { message: 'Post deleted successfully' };
};

// Add reaction
const addReaction = async (userId: string, postId: string, reactionType: string) => {
  const post = await FeedPost.findById(postId);

  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  // Remove existing reaction if any
  post.reactions = post.reactions.filter((r: any) => r.user.toString() !== userId);

  // Add new reaction
  post.reactions.push({
    user: new Types.ObjectId(userId),
    type: reactionType as any,
    createdAt: new Date(),
  });

  await post.save();

  return await FeedPost.findById(postId)
    .populate('user', 'name email profilePicture level')
    .populate('reactions.user', 'name profilePicture');
};

// Remove reaction
const removeReaction = async (userId: string, postId: string) => {
  const post = await FeedPost.findById(postId);

  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  post.reactions = post.reactions.filter((r: any) => r.user.toString() !== userId);

  await post.save();

  return await FeedPost.findById(postId).populate('user', 'name email profilePicture level');
};

// Add comment
const addComment = async (userId: string, postId: string, content: string) => {
  const post = await FeedPost.findById(postId);

  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  post.comments.push({
    _id: new Types.ObjectId(),
    user: new Types.ObjectId(userId),
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await post.save();

  return await FeedPost.findById(postId)
    .populate('user', 'name email profilePicture level')
    .populate('comments.user', 'name email profilePicture');
};

// Delete comment
const deleteComment = async (userId: string, postId: string, commentId: string) => {
  const post = await FeedPost.findById(postId);

  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  const comment = post.comments.find((c: any) => c._id.toString() === commentId);

  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  if (comment.user.toString() !== userId && post.user.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to delete this comment');
  }

  post.comments = post.comments.filter((c: any) => c._id.toString() !== commentId);

  await post.save();

  return await FeedPost.findById(postId)
    .populate('user', 'name email profilePicture level')
    .populate('comments.user', 'name email profilePicture');
};

// Share post
const sharePost = async (userId: string, postId: string, content?: string) => {
  const originalPost = await FeedPost.findById(postId);

  if (!originalPost) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  // Add user to shares array
  if (!originalPost.shares.includes(new Types.ObjectId(userId))) {
    originalPost.shares.push(new Types.ObjectId(userId));
    await originalPost.save();
  }

  // Create shared post
  const sharedPost = await FeedPost.create({
    user: userId,
    content: content || '',
    sharedPost: postId,
    visibility: 'friends',
  });

  return await FeedPost.findById(sharedPost._id)
    .populate('user', 'name email profilePicture level xp')
    .populate('sharedPost')
    .populate({
      path: 'sharedPost',
      populate: { path: 'user', select: 'name email profilePicture level' },
    });
};

export const postService = {
  createPost,
  getFeedPosts,
  getUserPosts,
  getPostById,
  updatePost,
  deletePost,
  addReaction,
  removeReaction,
  addComment,
  deleteComment,
  sharePost,
};

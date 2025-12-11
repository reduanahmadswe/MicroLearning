import PostComment from './comment.model';
import { Post } from './post.model';
import ApiError from '../../../utils/ApiError';

// Get comments for a post (only top-level comments)
const getPostComments = async (postId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const comments = await PostComment.find({ post: postId, parentComment: null })
    .populate('user', 'name profilePicture level')
    .populate({
      path: 'replies',
      populate: {
        path: 'user',
        select: 'name profilePicture level',
      },
      options: { sort: { createdAt: 1 } },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Filter out comments with deleted/invalid users
  const validComments = comments
    .filter(comment => comment.user && comment.user._id)
    .map(comment => ({
      ...comment,
      // Also filter out invalid replies
      replies: comment.replies?.filter((reply: any) => reply.user && reply.user._id) || []
    }));

  const total = await PostComment.countDocuments({ post: postId, parentComment: null });

  return {
    comments: validComments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get replies for a comment (nested comments)
const getCommentReplies = async (commentId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const replies = await PostComment.find({ parentComment: commentId })
    .populate('user', 'name profilePicture level')
    .populate({
      path: 'replies',
      populate: {
        path: 'user',
        select: 'name profilePicture level',
      },
    })
    .sort({ createdAt: 1 }) // Oldest first for replies
    .skip(skip)
    .limit(limit)
    .lean();

  // Filter out comments with deleted/invalid users
  const validReplies = replies.filter(reply => reply.user && reply.user._id);

  const total = await PostComment.countDocuments({ parentComment: commentId });

  return {
    replies: validReplies,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Add comment to a post
const addComment = async (postId: string, userId: string, content: string, parentCommentId?: string) => {
  // Check if post exists
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  // If replying to a comment, check if parent comment exists
  if (parentCommentId) {
    const parentComment = await PostComment.findById(parentCommentId);
    if (!parentComment) {
      throw new ApiError(404, 'Parent comment not found');
    }
  }

  // Create comment
  const comment = await PostComment.create({
    post: postId,
    user: userId,
    content,
    parentComment: parentCommentId || null,
  });

  // If it's a reply, add to parent's replies array
  if (parentCommentId) {
    await PostComment.findByIdAndUpdate(
      parentCommentId,
      { $push: { replies: comment._id } },
      { new: true }
    );
  }

  // Populate user data
  const populatedComment = await PostComment.findById(comment._id)
    .populate('user', 'name profilePicture level')
    .lean();

  return populatedComment;
};

// Update comment
const updateComment = async (commentId: string, userId: string, content: string) => {
  const comment = await PostComment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  if (comment.user.toString() !== userId) {
    throw new ApiError(403, 'You can only edit your own comments');
  }

  comment.content = content;
  comment.isEdited = true;
  await comment.save();

  const updatedComment = await PostComment.findById(commentId)
    .populate('user', 'name profilePicture level')
    .lean();

  return updatedComment;
};

// Delete comment
const deleteComment = async (commentId: string, userId: string) => {
  const comment = await PostComment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  if (comment.user.toString() !== userId) {
    throw new ApiError(403, 'You can only delete your own comments');
  }

  // Delete all nested replies recursively
  await deleteCommentRecursive(commentId);

  // Remove from parent's replies array if it's a reply
  if (comment.parentComment) {
    await PostComment.findByIdAndUpdate(comment.parentComment, {
      $pull: { replies: commentId },
    });
  }

  await PostComment.findByIdAndDelete(commentId);

  return { message: 'Comment deleted successfully' };
};

// Helper function to delete comment and all its replies recursively
const deleteCommentRecursive = async (commentId: string) => {
  const comment = await PostComment.findById(commentId);
  if (!comment) return;

  // Delete all replies first
  if (comment.replies && comment.replies.length > 0) {
    for (const replyId of comment.replies) {
      await deleteCommentRecursive(replyId.toString());
    }
  }

  await PostComment.findByIdAndDelete(commentId);
};

// Like/Unlike comment
const toggleLikeComment = async (commentId: string, userId: string) => {
  const comment = await PostComment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  const userIdObj = userId as any;
  const hasLiked = comment.likes.some((id: { toString: () => any; }) => id.toString() === userIdObj.toString());

  if (hasLiked) {
    // Unlike
    comment.likes = comment.likes.filter((id: { toString: () => any; }) => id.toString() !== userIdObj.toString());
  } else {
    // Like
    comment.likes.push(userIdObj);
  }

  await comment.save();

  const updatedComment = await PostComment.findById(commentId)
    .populate('user', 'name profilePicture level')
    .lean();

  return updatedComment;
};

export default {
  getPostComments,
  getCommentReplies,
  addComment,
  updateComment,
  deleteComment,
  toggleLikeComment,
};

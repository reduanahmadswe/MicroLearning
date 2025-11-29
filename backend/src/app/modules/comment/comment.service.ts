import Comment from './comment.model';
import Lesson from '../microLessons/lesson.model';
import ApiError from '../../../utils/ApiError';
import { ICreateCommentRequest, IUpdateCommentRequest } from './comment.types';

class CommentService {
  // Create comment
  async createComment(userId: string, data: ICreateCommentRequest) {
    // Verify lesson exists
    const lesson = await Lesson.findById(data.lesson);
    if (!lesson) {
      throw new ApiError(404, 'Lesson not found');
    }

    // Verify parent comment exists if provided
    if (data.parentComment) {
      const parentComment = await Comment.findById(data.parentComment);
      if (!parentComment) {
        throw new ApiError(404, 'Parent comment not found');
      }
      // Ensure parent comment belongs to the same lesson
      if (parentComment.lesson.toString() !== data.lesson) {
        throw new ApiError(400, 'Parent comment does not belong to this lesson');
      }
    }

    const comment = await Comment.create({
      ...data,
      user: userId,
    });

    return await Comment.findById(comment._id)
      .populate('user', 'name profilePicture level')
      .lean();
  }

  // Get lesson comments
  async getLessonComments(lessonId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    // Get top-level comments (no parent)
    const [comments, total] = await Promise.all([
      Comment.find({
        lesson: lessonId,
        parentComment: { $exists: false },
        isDeleted: false,
      })
        .populate('user', 'name profilePicture level')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments({
        lesson: lessonId,
        parentComment: { $exists: false },
        isDeleted: false,
      }),
    ]);

    // Get reply counts for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replyCount = await Comment.countDocuments({
          parentComment: comment._id,
          isDeleted: false,
        });
        return { ...comment, replyCount };
      })
    );

    return {
      comments: commentsWithReplies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get comment replies
  async getCommentReplies(commentId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [replies, total] = await Promise.all([
      Comment.find({
        parentComment: commentId,
        isDeleted: false,
      })
        .populate('user', 'name profilePicture level')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments({
        parentComment: commentId,
        isDeleted: false,
      }),
    ]);

    return {
      replies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Update comment
  async updateComment(
    commentId: string,
    userId: string,
    data: IUpdateCommentRequest
  ) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }

    if (comment.isDeleted) {
      throw new ApiError(400, 'Cannot update deleted comment');
    }

    if (comment.user.toString() !== userId) {
      throw new ApiError(403, 'You are not authorized to update this comment');
    }

    comment.content = data.content;
    comment.isEdited = true;
    await comment.save();

    return await Comment.findById(comment._id)
      .populate('user', 'name profilePicture level')
      .lean();
  }

  // Delete comment (soft delete)
  async deleteComment(commentId: string, userId: string, userRole: string) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }

    if (comment.isDeleted) {
      throw new ApiError(400, 'Comment already deleted');
    }

    // Check authorization (own comment or admin)
    if (comment.user.toString() !== userId && userRole !== 'admin') {
      throw new ApiError(403, 'You are not authorized to delete this comment');
    }

    comment.isDeleted = true;
    comment.content = '[Deleted]';
    await comment.save();

    return { message: 'Comment deleted successfully' };
  }

  // Like comment
  async likeComment(commentId: string, userId: string) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }

    if (comment.isDeleted) {
      throw new ApiError(400, 'Cannot like deleted comment');
    }

    // Check if user already liked
    const alreadyLiked = comment.likedBy.some(
      (id) => id.toString() === userId
    );

    if (alreadyLiked) {
      // Unlike
      comment.likedBy = comment.likedBy.filter(
        (id) => id.toString() !== userId
      );
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      // Like
      comment.likedBy.push(userId as any);
      comment.likes += 1;
    }

    await comment.save();

    return {
      likes: comment.likes,
      isLiked: !alreadyLiked,
    };
  }

  // Get user comments
  async getUserComments(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({
        user: userId,
        isDeleted: false,
      })
        .populate('lesson', 'title slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments({
        user: userId,
        isDeleted: false,
      }),
    ]);

    return {
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default new CommentService();

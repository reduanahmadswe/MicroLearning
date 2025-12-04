import { Schema, model } from 'mongoose';
import {
  IGroup,
  IPost,
  IForumComment,
  IPostLike,
  ICommentLike,
  IPostView,
  IGroupMember,
  IGroupInvitation,
  IPoll,
  IReportPost,
  IReportComment,
} from './forum.types';

/**
 * Group Schema
 */
const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    coverImage: {
      type: String,
    },
    privacy: {
      type: String,
      enum: ['public', 'private', 'restricted'],
      default: 'public',
      index: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    moderators: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    memberCount: {
      type: Number,
      default: 0,
    },
    postCount: {
      type: Number,
      default: 0,
    },
    rules: [
      {
        type: String,
      },
    ],
    tags: [
      {
        type: String,
        lowercase: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
groupSchema.index({ name: 'text', description: 'text' });
groupSchema.index({ category: 1, memberCount: -1 });
groupSchema.index({ tags: 1 });
groupSchema.index({ createdAt: -1 });

/**
 * Post Schema
 */
const postSchema = new Schema<IPost>(
  {
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    contentType: {
      type: String,
      enum: ['text', 'question', 'discussion', 'announcement', 'poll'],
      default: 'text',
      index: true,
    },
    images: [
      {
        type: String,
      },
    ],
    attachments: [
      {
        type: String,
      },
    ],
    tags: [
      {
        type: String,
        lowercase: true,
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    // Q&A specific fields
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      index: true,
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      index: true,
    },
    isHelpNeeded: {
      type: Boolean,
      default: false,
      index: true,
    },
    isSolved: {
      type: Boolean,
      default: false,
      index: true,
    },
    bestAnswer: {
      type: Schema.Types.ObjectId,
      ref: 'ForumComment',
    },
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    downvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ group: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ contentType: 1, createdAt: -1 });
postSchema.index({ likeCount: -1, commentCount: -1 });
postSchema.index({ course: 1, lesson: 1 });
postSchema.index({ isSolved: 1, isHelpNeeded: 1 });

/**
 * Forum Comment Schema
 */
const forumCommentSchema = new Schema<IForumComment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'ForumComment',
      index: true,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    isAcceptedAnswer: {
      type: Boolean,
      default: false,
    },
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    downvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
forumCommentSchema.index({ post: 1, createdAt: -1 });
forumCommentSchema.index({ parentComment: 1 });
forumCommentSchema.index({ author: 1 });
forumCommentSchema.index({ isAcceptedAnswer: 1 });

/**
 * Post Like Schema
 */
const postLikeSchema = new Schema<IPostLike>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index
postLikeSchema.index({ post: 1, user: 1 }, { unique: true });

/**
 * Comment Like Schema
 */
const commentLikeSchema = new Schema<ICommentLike>(
  {
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'ForumComment',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index
commentLikeSchema.index({ comment: 1, user: 1 }, { unique: true });

/**
 * Post View Schema
 */
const postViewSchema = new Schema<IPostView>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index - each user can view a post only once
postViewSchema.index({ post: 1, user: 1 }, { unique: true });

/**
 * Group Member Schema
 */
const groupMemberSchema = new Schema<IGroupMember>(
  {
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    lastActive: {
      type: Date,
    },
  },
  {
    timestamps: false,
  }
);

// Compound unique index
groupMemberSchema.index({ group: 1, user: 1 }, { unique: true });

/**
 * Group Invitation Schema
 */
const groupInvitationSchema = new Schema<IGroupInvitation>(
  {
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invitedUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
groupInvitationSchema.index({ invitedUser: 1, status: 1 });
groupInvitationSchema.index({ expiresAt: 1 });

/**
 * Poll Schema
 */
const pollOptionSchema = new Schema(
  {
    option: {
      type: String,
      required: true,
    },
    votes: {
      type: Number,
      default: 0,
    },
    voters: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { _id: false }
);

const pollSchema = new Schema<IPoll>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      unique: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
    },
    options: [pollOptionSchema],
    multipleChoice: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Report Post Schema
 */
const reportPostSchema = new Schema<IReportPost>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'misinformation', 'other'],
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewNote: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Report Comment Schema
 */
const reportCommentSchema = new Schema<IReportComment>(
  {
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'ForumComment',
      required: true,
      index: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'misinformation', 'other'],
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewNote: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Group = model<IGroup>('Group', groupSchema);
export const Post = model<IPost>('Post', postSchema);
export const ForumComment = model<IForumComment>('ForumComment', forumCommentSchema);
export const PostLike = model<IPostLike>('PostLike', postLikeSchema);
export const CommentLike = model<ICommentLike>('CommentLike', commentLikeSchema);
export const PostView = model<IPostView>('PostView', postViewSchema);
export const GroupMember = model<IGroupMember>('GroupMember', groupMemberSchema);
export const GroupInvitation = model<IGroupInvitation>('GroupInvitation', groupInvitationSchema);
export const Poll = model<IPoll>('Poll', pollSchema);
export const ReportPost = model<IReportPost>('ReportPost', reportPostSchema);
export const ReportComment = model<IReportComment>('ReportComment', reportCommentSchema);

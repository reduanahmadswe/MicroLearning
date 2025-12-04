import { Document, Types } from 'mongoose';

/**
 * Forum Group Types
 */
export interface IGroup extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  category: string;
  coverImage?: string;
  privacy: 'public' | 'private' | 'restricted';
  creator: Types.ObjectId;
  moderators: Types.ObjectId[];
  members: Types.ObjectId[];
  memberCount: number;
  postCount: number;
  rules?: string[];
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateGroupRequest {
  name: string;
  description: string;
  category: string;
  coverImage?: string;
  privacy: 'public' | 'private' | 'restricted';
  rules?: string[];
  tags?: string[];
}

/**
 * Forum Post Types
 */
export interface IPost extends Document {
  _id: Types.ObjectId;
  group: Types.ObjectId;
  author: Types.ObjectId;
  title: string;
  content: string;
  contentType: 'text' | 'question' | 'discussion' | 'announcement' | 'poll';
  images?: string[];
  attachments?: string[];
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  // Q&A specific fields
  course?: Types.ObjectId;
  lesson?: Types.ObjectId;
  isHelpNeeded: boolean;
  isSolved: boolean;
  bestAnswer?: Types.ObjectId;
  upvotes: Types.ObjectId[];
  downvotes: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatePostRequest {
  groupId: string;
  title: string;
  content: string;
  contentType: 'text' | 'question' | 'discussion' | 'announcement' | 'poll';
  images?: string[];
  attachments?: string[];
  tags?: string[];
}

/**
 * Forum Comment Types
 */
export interface IForumComment extends Document {
  _id: Types.ObjectId;
  post: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  parentComment?: Types.ObjectId; // For nested replies
  likeCount: number;
  isAcceptedAnswer: boolean; // For question posts (best answer)
  upvotes: Types.ObjectId[];
  downvotes: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCommentRequest {
  postId: string;
  content: string;
  parentCommentId?: string;
}

/**
 * Post Like Types
 */
export interface IPostLike extends Document {
  _id: Types.ObjectId;
  post: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
}

/**
 * Comment Like Types
 */
export interface ICommentLike extends Document {
  _id: Types.ObjectId;
  comment: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
}

/**
 * Post View Types
 */
export interface IPostView extends Document {
  _id: Types.ObjectId;
  post: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
}

/**
 * Post View Types
 */
export interface IPostView extends Document {
  _id: Types.ObjectId;
  post: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
}

/**
 * Group Member Types
 */
export interface IGroupMember extends Document {
  _id: Types.ObjectId;
  group: Types.ObjectId;
  user: Types.ObjectId;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: Date;
  lastActive?: Date;
}

export interface IJoinGroupRequest {
  groupId: string;
}

/**
 * Group Invitation Types
 */
export interface IGroupInvitation extends Document {
  _id: Types.ObjectId;
  group: Types.ObjectId;
  invitedBy: Types.ObjectId;
  invitedUser: Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  expiresAt: Date;
  createdAt: Date;
}

export interface IInviteUserRequest {
  groupId: string;
  userId: string;
}

/**
 * Poll Types (for poll posts)
 */
export interface IPollOption {
  option: string;
  votes: number;
  voters: Types.ObjectId[];
}

export interface IPoll extends Document {
  _id: Types.ObjectId;
  post: Types.ObjectId;
  question: string;
  options: IPollOption[];
  multipleChoice: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

export interface ICreatePollRequest {
  postId: string;
  question: string;
  options: string[];
  multipleChoice?: boolean;
  expiresAt?: Date;
}

export interface IVotePollRequest {
  pollId: string;
  optionIndex: number;
}

/**
 * Forum Statistics Types
 */
export interface IForumStats {
  totalGroups: number;
  totalPosts: number;
  totalComments: number;
  totalMembers: number;
  activeGroups: number;
  popularGroups: IGroup[];
  recentPosts: IPost[];
  trendingTags: { tag: string; count: number }[];
}

export interface IGroupStats {
  memberCount: number;
  postCount: number;
  commentCount: number;
  activeMembers: number;
  topContributors: {
    user: Types.ObjectId;
    postCount: number;
    commentCount: number;
  }[];
  recentActivity: {
    posts: number;
    comments: number;
    newMembers: number;
  };
}

/**
 * Moderation Types
 */
export interface IReportPost extends Document {
  _id: Types.ObjectId;
  post: Types.ObjectId;
  reportedBy: Types.ObjectId;
  reason: 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: Types.ObjectId;
  reviewNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReportComment extends Document {
  _id: Types.ObjectId;
  comment: Types.ObjectId;
  reportedBy: Types.ObjectId;
  reason: 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: Types.ObjectId;
  reviewNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReportRequest {
  reason: 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other';
  description?: string;
}

/**
 * Search & Filter Types
 */
export interface IForumSearchQuery {
  query?: string;
  category?: string;
  tags?: string[];
  privacy?: 'public' | 'private' | 'restricted';
  sortBy?: 'recent' | 'popular' | 'members' | 'posts';
  page?: number;
  limit?: number;
}

export interface IPostSearchQuery {
  query?: string;
  groupId?: string;
  contentType?: 'text' | 'question' | 'discussion' | 'announcement' | 'poll';
  tags?: string[];
  authorId?: string;
  sortBy?: 'recent' | 'popular' | 'mostCommented' | 'unanswered';
  page?: number;
  limit?: number;
}

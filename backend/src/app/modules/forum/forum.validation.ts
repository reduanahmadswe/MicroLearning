import { z } from 'zod';

/**
 * Group Validation
 */
export const createGroupSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Group name must be at least 3 characters').max(100),
    description: z.string().min(10, 'Description must be at least 10 characters').max(500),
    category: z.string().min(1, 'Category is required'),
    coverImage: z.string().url().optional(),
    privacy: z.enum(['public', 'private', 'restricted']).default('public'),
    rules: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateGroupSchema = z.object({
  params: z.object({
    groupId: z.string().min(1, 'Group ID is required'),
  }),
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().min(10).max(500).optional(),
    category: z.string().optional(),
    coverImage: z.string().url().optional(),
    privacy: z.enum(['public', 'private', 'restricted']).optional(),
    rules: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

/**
 * Post Validation
 */
export const createPostSchema = z.object({
  body: z.object({
    groupId: z.string().min(1, 'Group ID is required'),
    title: z.string().min(5, 'Title must be at least 5 characters').max(200),
    content: z.string().min(10, 'Content must be at least 10 characters').max(10000),
    contentType: z.enum(['text', 'question', 'discussion', 'announcement', 'poll']).default('text'),
    images: z.array(z.string().url()).optional(),
    attachments: z.array(z.string().url()).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updatePostSchema = z.object({
  params: z.object({
    postId: z.string().min(1, 'Post ID is required'),
  }),
  body: z.object({
    title: z.string().min(5).max(200).optional(),
    content: z.string().min(10).max(10000).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

/**
 * Comment Validation
 */
export const createCommentSchema = z.object({
  body: z.object({
    postId: z.string().min(1, 'Post ID is required'),
    content: z.string().min(1, 'Content cannot be empty').max(5000),
    parentCommentId: z.string().optional(),
  }),
});

export const updateCommentSchema = z.object({
  params: z.object({
    commentId: z.string().min(1, 'Comment ID is required'),
  }),
  body: z.object({
    content: z.string().min(1).max(5000),
  }),
});

/**
 * Join/Leave Group Validation
 */
export const joinGroupSchema = z.object({
  params: z.object({
    groupId: z.string().min(1, 'Group ID is required'),
  }),
});

export const leaveGroupSchema = z.object({
  params: z.object({
    groupId: z.string().min(1, 'Group ID is required'),
  }),
});

/**
 * Invitation Validation
 */
export const inviteUserSchema = z.object({
  body: z.object({
    groupId: z.string().min(1, 'Group ID is required'),
    userId: z.string().min(1, 'User ID is required'),
  }),
});

export const respondInvitationSchema = z.object({
  params: z.object({
    invitationId: z.string().min(1, 'Invitation ID is required'),
  }),
  body: z.object({
    accept: z.boolean(),
  }),
});

/**
 * Poll Validation
 */
export const createPollSchema = z.object({
  body: z.object({
    postId: z.string().min(1, 'Post ID is required'),
    question: z.string().min(5, 'Question must be at least 5 characters').max(200),
    options: z.array(z.string().min(1)).min(2, 'At least 2 options required').max(10),
    multipleChoice: z.boolean().optional().default(false),
    expiresAt: z.string().datetime().optional(),
  }),
});

export const votePollSchema = z.object({
  params: z.object({
    pollId: z.string().min(1, 'Poll ID is required'),
  }),
  body: z.object({
    optionIndex: z.number().min(0, 'Invalid option index'),
  }),
});

/**
 * Like/Unlike Validation
 */
export const likePostSchema = z.object({
  params: z.object({
    postId: z.string().min(1, 'Post ID is required'),
  }),
});

export const likeCommentSchema = z.object({
  params: z.object({
    commentId: z.string().min(1, 'Comment ID is required'),
  }),
});

/**
 * Report Validation
 */
export const reportPostSchema = z.object({
  params: z.object({
    postId: z.string().min(1, 'Post ID is required'),
  }),
  body: z.object({
    reason: z.enum(['spam', 'inappropriate', 'harassment', 'misinformation', 'other']),
    description: z.string().max(500).optional(),
  }),
});

export const reportCommentSchema = z.object({
  params: z.object({
    commentId: z.string().min(1, 'Comment ID is required'),
  }),
  body: z.object({
    reason: z.enum(['spam', 'inappropriate', 'harassment', 'misinformation', 'other']),
    description: z.string().max(500).optional(),
  }),
});

/**
 * Search & Filter Validation
 */
export const searchGroupsSchema = z.object({
  query: z.object({
    query: z.string().optional(),
    category: z.string().optional(),
    tags: z.string().optional(), // comma-separated
    privacy: z.enum(['public', 'private', 'restricted']).optional(),
    sortBy: z.enum(['recent', 'popular', 'members', 'posts']).optional().default('popular'),
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
  }),
});

export const searchPostsSchema = z.object({
  query: z.object({
    query: z.string().optional(),
    groupId: z.string().optional(),
    contentType: z.enum(['text', 'question', 'discussion', 'announcement', 'poll']).optional(),
    tags: z.string().optional(), // comma-separated
    authorId: z.string().optional(),
    sortBy: z.enum(['recent', 'popular', 'mostCommented', 'unanswered']).optional().default('recent'),
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
  }),
});

/**
 * Moderation Validation
 */
export const pinPostSchema = z.object({
  params: z.object({
    postId: z.string().min(1, 'Post ID is required'),
  }),
});

export const lockPostSchema = z.object({
  params: z.object({
    postId: z.string().min(1, 'Post ID is required'),
  }),
});

export const acceptAnswerSchema = z.object({
  params: z.object({
    commentId: z.string().min(1, 'Comment ID is required'),
  }),
});

export const updateMemberRoleSchema = z.object({
  params: z.object({
    groupId: z.string().min(1, 'Group ID is required'),
    userId: z.string().min(1, 'User ID is required'),
  }),
  body: z.object({
    role: z.enum(['member', 'moderator', 'admin']),
  }),
});

import express from 'express';
import { authGuard } from '../../../middleware/authGuard';
import { validateRequest } from '../../../middleware/validateRequest';
import * as ForumController from './forum.controller';
import * as ForumValidation from './forum.validation';

const router = express.Router();

/**
 * GROUP ROUTES
 */
// Public routes
router.get('/groups', ForumController.getGroups);
router.get('/groups/:groupId', ForumController.getGroupDetails);
router.get('/groups/:groupId/members', ForumController.getGroupMembers);
router.get('/groups/:groupId/stats', ForumController.getGroupStats);

// Protected routes (require authentication)
router.post(
  '/groups',
  authGuard(),
  validateRequest(ForumValidation.createGroupSchema),
  ForumController.createGroup
);

router.patch(
  '/groups/:groupId',
  authGuard(),
  validateRequest(ForumValidation.updateGroupSchema),
  ForumController.updateGroup
);

router.delete('/groups/:groupId', authGuard(), ForumController.deleteGroup);

router.post(
  '/groups/:groupId/join',
  authGuard(),
  validateRequest(ForumValidation.joinGroupSchema),
  ForumController.joinGroup
);

router.post(
  '/groups/:groupId/leave',
  authGuard(),
  validateRequest(ForumValidation.leaveGroupSchema),
  ForumController.leaveGroup
);

router.post(
  '/groups/invitations',
  authGuard(),
  validateRequest(ForumValidation.inviteUserSchema),
  ForumController.inviteUser
);

router.get('/groups/invitations/me', authGuard(), ForumController.getUserInvitations);

router.patch(
  '/groups/invitations/:invitationId',
  authGuard(),
  validateRequest(ForumValidation.respondInvitationSchema),
  ForumController.respondToInvitation
);

router.patch(
  '/groups/:groupId/members/:userId/role',
  authGuard(),
  validateRequest(ForumValidation.updateMemberRoleSchema),
  ForumController.updateMemberRole
);

/**
 * POST ROUTES
 */
// Public routes
router.get('/posts', ForumController.getPosts);
router.get('/posts/:postId', ForumController.getPostDetails);

// Protected routes
router.post(
  '/posts',
  authGuard(),
  validateRequest(ForumValidation.createPostSchema),
  ForumController.createPost
);

router.patch(
  '/posts/:postId',
  authGuard(),
  validateRequest(ForumValidation.updatePostSchema),
  ForumController.updatePost
);

router.delete('/posts/:postId', authGuard(), ForumController.deletePost);

router.post(
  '/posts/:postId/like',
  authGuard(),
  validateRequest(ForumValidation.likePostSchema),
  ForumController.togglePostLike
);

router.patch(
  '/posts/:postId/pin',
  authGuard(),
  validateRequest(ForumValidation.pinPostSchema),
  ForumController.togglePinPost
);

router.patch(
  '/posts/:postId/lock',
  authGuard(),
  validateRequest(ForumValidation.lockPostSchema),
  ForumController.toggleLockPost
);

/**
 * COMMENT ROUTES
 */
// Public routes
router.get('/posts/:postId/comments', ForumController.getComments);

// Protected routes
router.post(
  '/comments',
  authGuard(),
  validateRequest(ForumValidation.createCommentSchema),
  ForumController.createComment
);

router.patch(
  '/comments/:commentId',
  authGuard(),
  validateRequest(ForumValidation.updateCommentSchema),
  ForumController.updateComment
);

router.delete('/comments/:commentId', authGuard(), ForumController.deleteComment);

router.post(
  '/comments/:commentId/like',
  authGuard(),
  validateRequest(ForumValidation.likeCommentSchema),
  ForumController.toggleCommentLike
);

router.patch(
  '/comments/:commentId/accept',
  authGuard(),
  validateRequest(ForumValidation.acceptAnswerSchema),
  ForumController.acceptAnswer
);

/**
 * POLL ROUTES
 */
// Public routes
router.get('/polls/:pollId/results', ForumController.getPollResults);

// Protected routes
router.post(
  '/polls',
  authGuard(),
  validateRequest(ForumValidation.createPollSchema),
  ForumController.createPoll
);

router.post(
  '/polls/:pollId/vote',
  authGuard(),
  validateRequest(ForumValidation.votePollSchema),
  ForumController.votePoll
);

/**
 * MODERATION ROUTES
 */
// Protected routes
router.post(
  '/posts/:postId/report',
  authGuard(),
  validateRequest(ForumValidation.reportPostSchema),
  ForumController.reportPost
);

router.post(
  '/comments/:commentId/report',
  authGuard(),
  validateRequest(ForumValidation.reportCommentSchema),
  ForumController.reportComment
);

/**
 * STATISTICS ROUTES
 */
// Public routes
router.get('/stats', ForumController.getForumStats);

export default router;

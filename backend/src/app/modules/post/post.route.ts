import express from 'express';
import { authGuard } from '../../../middleware/authGuard';
import { validateRequest } from '../../../middleware/validateRequest';
import * as postController from './post.controller';
import * as commentController from './comment.controller';
import * as postValidation from './post.validation';
import * as commentValidation from './comment.validation';

const router = express.Router();

// Create post
router.post(
  '/',
  authGuard(),
  validateRequest(postValidation.createPostSchema),
  postController.createPost
);

// Get feed posts
router.get('/feed', authGuard(), postController.getFeedPosts);

// Get user posts
router.get('/user/:userId', authGuard(), postController.getUserPosts);

// Get single post
router.get('/:postId', authGuard(), postController.getPostById);

// Update post
router.put(
  '/:postId',
  authGuard(),
  validateRequest(postValidation.updatePostSchema),
  postController.updatePost
);

// Delete post
router.delete('/:postId', authGuard(), postController.deletePost);

// Add reaction
router.post(
  '/:postId/react',
  authGuard(),
  validateRequest(postValidation.addReactionSchema),
  postController.addReaction
);

// Remove reaction
router.delete('/:postId/react', authGuard(), postController.removeReaction);

// Add comment
router.post(
  '/:postId/comment',
  authGuard(),
  validateRequest(postValidation.addCommentSchema),
  postController.addComment
);

// Delete comment
router.delete('/:postId/comment/:commentId', authGuard(), postController.deleteComment);

// Share post
router.post(
  '/:postId/share',
  authGuard(),
  validateRequest(postValidation.sharePostSchema),
  postController.sharePost
);

// ========== Comment Routes (Nested Comments) ==========

// Get comments for a post
router.get('/:postId/comments', authGuard(), commentController.getPostComments);

// Get replies for a comment
router.get('/comments/:commentId/replies', authGuard(), commentController.getCommentReplies);

// Add comment (or reply to comment)
router.post(
  '/:postId/comments',
  authGuard(),
  validateRequest(commentValidation.addCommentSchema),
  commentController.addComment
);

// Update comment
router.put(
  '/comments/:commentId',
  authGuard(),
  validateRequest(commentValidation.updateCommentSchema),
  commentController.updateComment
);

// Delete comment
router.delete('/comments/:commentId', authGuard(), commentController.deleteComment);

// Like/Unlike comment
router.post('/comments/:commentId/like', authGuard(), commentController.toggleLikeComment);

export default router;

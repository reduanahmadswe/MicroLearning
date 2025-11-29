import express from 'express';
import { FriendController } from './friend.controller';
import { authGuard } from '../../../middleware/authGuard';
import { validateRequest } from '../../../middleware/validateRequest';
import {
  sendFriendRequestSchema,
  respondToRequestSchema,
  removeFriendSchema,
  blockUserSchema,
} from './friend.validation';

const router = express.Router();

// All routes require authentication
router.use(authGuard());

// Send friend request
router.post('/send', validateRequest(sendFriendRequestSchema), FriendController.sendFriendRequest);

// Get friend requests (received)
router.get('/requests', FriendController.getFriendRequests);

// Get sent requests
router.get('/requests/sent', FriendController.getSentRequests);

// Respond to friend request (accept/reject)
router.post('/respond', validateRequest(respondToRequestSchema), FriendController.respondToRequest);

// Get all friends
router.get('/', FriendController.getFriends);

// Get friend statistics
router.get('/stats', FriendController.getFriendStats);

// Get friend recommendations
router.get('/recommendations', FriendController.getFriendRecommendations);

// Remove friend
router.delete('/:friendId', validateRequest(removeFriendSchema), FriendController.removeFriend);

// Block user
router.post('/block/:userId', validateRequest(blockUserSchema), FriendController.blockUser);

// Unblock user
router.delete('/block/:userId', validateRequest(blockUserSchema), FriendController.unblockUser);

// Get blocked users
router.get('/blocked', FriendController.getBlockedUsers);

export const FriendRoutes = router;

import express from 'express';
import { ChallengeController } from './challenge.controller';
import authGuard from '../../../middleware/authGuard';
import validateRequest from '../../../middleware/validateRequest';
import {
  createChallengeSchema,
  challengeFriendSchema,
  respondToChallengeSchema,
} from './challenge.validation';

const router = express.Router();

// All routes require authentication
router.use(authGuard());

// Get daily challenge
router.get('/daily', ChallengeController.getDailyChallenge);

// Get all active challenges
router.get('/active', ChallengeController.getActiveChallenges);

// Get my challenges with friends
router.get('/me', ChallengeController.getMyChallenges);

// Get challenge statistics
router.get('/stats', ChallengeController.getChallengeStats);

// Update challenge progress
router.post('/progress/:challengeId', ChallengeController.updateChallengeProgress);

// Challenge a friend
router.post('/friend', validateRequest(challengeFriendSchema), ChallengeController.challengeFriend);

// Respond to friend challenge
router.post('/respond', validateRequest(respondToChallengeSchema), ChallengeController.respondToChallenge);

// Create challenge (admin/instructor only)
router.post(
  '/',
  authGuard('admin', 'instructor'),
  validateRequest(createChallengeSchema),
  ChallengeController.createChallenge
);

export const ChallengeRoutes = router;

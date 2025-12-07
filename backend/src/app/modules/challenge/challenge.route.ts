import express from 'express';
import { ChallengeController } from './challenge.controller';
import { authGuard } from '../../../middleware/authGuard';
import { validateRequest } from '../../../middleware/validateRequest';
import {
  createChallengeSchema,
  challengeFriendSchema,
  respondToChallengeSchema,
} from './challenge.validation';

const router = express.Router();

// All routes require authentication
router.use(authGuard());

// Get all challenges (list view)
router.get('/', ChallengeController.getActiveChallenges);

// Get daily challenge
router.get('/daily', ChallengeController.getDailyChallenge);

// Get all active challenges
router.get('/active', ChallengeController.getActiveChallenges);

// Get my challenges with friends
router.get('/me', ChallengeController.getMyChallenges);

// Get challenge statistics
router.get('/stats', ChallengeController.getChallengeStats);
router.get('/stats/me', ChallengeController.getChallengeStats); // Alias for frontend

// Update challenge progress
router.post('/progress/:challengeId', ChallengeController.updateChallengeProgress);

// Challenge a friend
router.post('/friend', validateRequest(challengeFriendSchema), ChallengeController.challengeFriend);

// Respond to friend challenge
router.post('/respond', validateRequest(respondToChallengeSchema), ChallengeController.respondToChallenge);

// Quiz Battle routes (public)
router.get('/quiz-battles', ChallengeController.getQuizBattles);
router.post('/quiz-battles', ChallengeController.createQuizBattle);

// Create challenge (admin/instructor only)
router.post(
  '/',
  authGuard('admin', 'instructor'),
  validateRequest(createChallengeSchema),
  ChallengeController.createChallenge
);

// Admin routes
router.get('/admin/all', authGuard('admin'), ChallengeController.getAllChallengesAdmin);
router.patch('/admin/:challengeId', authGuard('admin'), ChallengeController.updateChallenge);
router.delete('/admin/:challengeId', authGuard('admin'), ChallengeController.deleteChallenge);
router.post('/admin/quiz-battle', authGuard('admin'), ChallengeController.createQuizBattle);
router.get('/admin/quiz-battles', authGuard('admin'), ChallengeController.getQuizBattles);

export const ChallengeRoutes = router;

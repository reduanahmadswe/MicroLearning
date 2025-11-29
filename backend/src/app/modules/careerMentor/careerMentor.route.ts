import express from 'express';
import { validateRequest } from '../../../middleware/validateRequest';
import { authGuard } from '../../../middleware/authGuard';
import * as CareerMentorController from './careerMentor.controller';
import * as CareerMentorValidation from './careerMentor.validation';

const router = express.Router();

// Career advice chat
router.post(
  '/advice',
  authGuard(),
  validateRequest(CareerMentorValidation.careerAdviceSchema),
  CareerMentorController.getCareerAdvice
);

// Skill assessment
router.post(
  '/assess-skills',
  authGuard(),
  validateRequest(CareerMentorValidation.skillAssessmentSchema),
  CareerMentorController.assessSkills
);

// Interview preparation
router.post(
  '/interview-prep',
  authGuard(),
  validateRequest(CareerMentorValidation.interviewPrepSchema),
  CareerMentorController.prepareInterview
);

// Resume review
router.post(
  '/resume-review',
  authGuard(),
  validateRequest(CareerMentorValidation.resumeReviewSchema),
  CareerMentorController.reviewResume
);

// Salary negotiation advice
router.post(
  '/salary-negotiation',
  authGuard(),
  validateRequest(CareerMentorValidation.salaryNegotiationSchema),
  CareerMentorController.getSalaryNegotiationAdvice
);

// Get sessions
router.get(
  '/sessions',
  authGuard(),
  validateRequest(CareerMentorValidation.getSessionsSchema),
  CareerMentorController.getSessions
);

// Get session by ID
router.get(
  '/sessions/:sessionId',
  authGuard(),
  validateRequest(CareerMentorValidation.getSessionSchema),
  CareerMentorController.getSessionById
);

// Delete session
router.delete(
  '/sessions/:sessionId',
  authGuard(),
  validateRequest(CareerMentorValidation.deleteSessionSchema),
  CareerMentorController.deleteSession
);

// Get statistics
router.get(
  '/stats',
  authGuard(),
  CareerMentorController.getCareerMentorStats
);

export default router;

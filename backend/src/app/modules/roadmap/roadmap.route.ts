import express from 'express';
import { validateRequest } from '../../../middleware/validateRequest';
import { authGuard } from '../../../middleware/authGuard';
import * as RoadmapController from './roadmap.controller';
import * as RoadmapValidation from './roadmap.validation';

const router = express.Router();

// Generate roadmap
router.post(
  '/generate',
  authGuard(),
  validateRequest(RoadmapValidation.generateRoadmapSchema),
  RoadmapController.generateRoadmap
);

// Get user roadmaps
router.get(
  '/',
  authGuard(),
  validateRequest(RoadmapValidation.getUserRoadmapsSchema),
  RoadmapController.getUserRoadmaps
);

// Get roadmap by ID
router.get(
  '/:roadmapId',
  authGuard(),
  validateRequest(RoadmapValidation.getRoadmapSchema),
  RoadmapController.getRoadmapById
);

// Update roadmap progress
router.patch(
  '/:roadmapId/progress',
  authGuard(),
  validateRequest(RoadmapValidation.updateProgressSchema),
  RoadmapController.updateRoadmapProgress
);

// Delete roadmap
router.delete(
  '/:roadmapId',
  authGuard(),
  validateRequest(RoadmapValidation.deleteRoadmapSchema),
  RoadmapController.deleteRoadmap
);

// Get statistics
router.get(
  '/stats/overview',
  authGuard(),
  RoadmapController.getRoadmapStats
);

export default router;

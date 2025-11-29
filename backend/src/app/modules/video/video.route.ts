import express from 'express';
import { authGuard } from '../../../middleware/authGuard';
import { validateRequest } from '../../../middleware/validateRequest';
import * as VideoController from './video.controller';
import * as VideoValidation from './video.validation';

const router = express.Router();

/**
 * VIDEO ROUTES
 */
// Public routes
router.get('/', VideoController.getVideos);
router.get('/:videoId', VideoController.getVideoDetails);
router.post('/:videoId/view', VideoController.incrementViewCount);

// Protected routes (require authentication)
router.post(
  '/',
  authGuard(),
  validateRequest(VideoValidation.createVideoSchema),
  VideoController.createVideo
);

router.patch(
  '/:videoId',
  authGuard(),
  validateRequest(VideoValidation.updateVideoSchema),
  VideoController.updateVideo
);

router.delete('/:videoId', authGuard(), VideoController.deleteVideo);

router.patch(
  '/:videoId/status',
  authGuard(),
  validateRequest(VideoValidation.updateStatusSchema),
  VideoController.updateVideoStatus
);

router.post(
  '/:videoId/qualities',
  authGuard(),
  validateRequest(VideoValidation.addQualitySchema),
  VideoController.addVideoQuality
);

router.post(
  '/:videoId/subtitles',
  authGuard(),
  validateRequest(VideoValidation.addSubtitleSchema),
  VideoController.addSubtitle
);

router.delete('/:videoId/subtitles/:languageCode', authGuard(), VideoController.removeSubtitle);

/**
 * PROGRESS ROUTES
 */
router.post(
  '/:videoId/progress',
  authGuard(),
  validateRequest(VideoValidation.updateProgressSchema),
  VideoController.updateProgress
);

router.get('/:videoId/progress/me', authGuard(), VideoController.getUserProgress);

router.get('/lessons/:lessonId/progress', authGuard(), VideoController.getUserProgressByLesson);

router.get('/progress/me', authGuard(), VideoController.getAllUserProgress);

/**
 * ANALYTICS ROUTES
 */
router.get('/:videoId/analytics', authGuard(), VideoController.getVideoAnalytics);

router.get('/stats/me', authGuard(), VideoController.getVideoStats);

export default router;

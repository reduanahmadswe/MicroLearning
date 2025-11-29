import { Router } from 'express';
import courseController from './course.controller';
import { validateRequest } from '../../../middleware/validateRequest';
import { createCourseValidation, updateCourseValidation } from './course.validation';
import { authGuard } from '../../../middleware/authGuard';

const router = Router();

// Public routes
router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourseById);
router.get('/:id/statistics', courseController.getCourseStatistics);

// Protected routes
router.post(
  '/',
  authGuard('instructor', 'admin'),
  validateRequest(createCourseValidation),
  courseController.createCourse
);

router.put(
  '/:id',
  authGuard('instructor', 'admin'),
  validateRequest(updateCourseValidation),
  courseController.updateCourse
);

router.delete('/:id', authGuard('instructor', 'admin'), courseController.deleteCourse);

// Enrollment routes
router.post('/:id/enroll', authGuard(), courseController.enrollInCourse);
router.get('/enrollments/me', authGuard(), courseController.getMyEnrollments);
router.post('/progress/update', authGuard(), courseController.updateProgress);

export default router;

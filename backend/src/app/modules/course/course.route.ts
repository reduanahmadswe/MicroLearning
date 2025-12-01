import { Router } from 'express';
import courseController from './course.controller';
import { validateRequest } from '../../../middleware/validateRequest';
import { createCourseValidation, updateCourseValidation } from './course.validation';
import { authGuard } from '../../../middleware/authGuard';

const router = Router();

// Public routes
router.get('/', courseController.getCourses);

// Instructor routes (must come before /:id routes)
router.get('/instructor/my-courses', authGuard('instructor', 'admin'), courseController.getInstructorCourses);
router.get('/instructor/analytics', authGuard('instructor', 'admin'), courseController.getInstructorAnalytics);
router.get('/instructor/:courseId/students', authGuard('instructor', 'admin'), courseController.getCourseStudents);

// Enrollment routes (before /:id)
router.get('/enrollments/me', authGuard(), courseController.getMyEnrollments);
router.post('/progress/update', authGuard(), courseController.updateProgress);

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

// Enrollment actions
router.post('/:id/enroll', authGuard(), courseController.enrollInCourse);

// Dynamic routes (must be last)
router.get('/:id/statistics', courseController.getCourseStatistics);
router.get('/:id', courseController.getCourseById);

export default router;

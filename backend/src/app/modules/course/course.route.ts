import { Router } from 'express';
import courseController from './course.controller';
import * as coursePaymentController from './course.payment.controller';
import { validateRequest } from '../../../middleware/validateRequest';
import { createCourseValidation, updateCourseValidation } from './course.validation';
import { authGuard } from '../../../middleware/authGuard';

const router = Router();

// Payment routes (must come before /:id routes)
router.post('/payment/initiate', authGuard(), coursePaymentController.initiateCoursePayment);
router.post('/payment/success', coursePaymentController.paymentSuccess);
router.post('/payment/fail', coursePaymentController.paymentFail);
router.post('/payment/cancel', coursePaymentController.paymentCancel);
router.post('/payment/ipn', coursePaymentController.paymentIPN);
router.get('/payment/history', authGuard(), coursePaymentController.getUserPayments);

// Public routes
router.get('/', courseController.getCourses);

// Instructor routes (must come before /:id routes)
router.get('/instructor/my-courses', authGuard('instructor', 'admin'), courseController.getInstructorCourses);
router.get('/instructor/analytics', authGuard('instructor', 'admin'), courseController.getInstructorAnalytics);
router.get('/instructor/students', authGuard('instructor', 'admin'), courseController.getInstructorStudents);
router.get('/instructor/:courseId/students', authGuard('instructor', 'admin'), courseController.getCourseStudents);

// Enrollment routes (before /:id)
router.get('/enrollments/me', authGuard(), courseController.getMyEnrollments);
router.get('/:id/enrollment', authGuard(), courseController.getEnrollment);
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

// Publish/Unpublish course
router.patch('/:id/publish', authGuard('instructor', 'admin'), courseController.togglePublish);

// Enrollment actions
router.post('/:id/enroll', authGuard(), courseController.enrollInCourse);

// Dynamic routes (must be last)
router.get('/:id/statistics', courseController.getCourseStatistics);
router.get('/:id', courseController.getCourseById);

export default router;

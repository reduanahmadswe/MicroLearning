import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import courseService from './course.service';

class CourseController {
  // Create course
  createCourse = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await courseService.createCourse(userId, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Course created successfully',
      data: result,
    });
  });

  // Get all courses
  getCourses = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filters = {
      topic: req.query.topic as string,
      difficulty: req.query.difficulty as string,
      isPremium: req.query.isPremium as string,
      author: req.query.author as string,
    };

    const result = await courseService.getCourses(page, limit, filters);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Courses retrieved successfully',
      data: result.courses,
      meta: result.pagination,
    });
  });

  // Get course by ID
  getCourseById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const result = await courseService.getCourseById(id, userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Course retrieved successfully',
      data: result,
    });
  });

  // Update course
  updateCourse = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId as string;
    const userRole = req.user?.role as string;
    const result = await courseService.updateCourse(id, userId, userRole, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Course updated successfully',
      data: result,
    });
  });

  // Delete course
  deleteCourse = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId as string;
    const userRole = req.user?.role as string;
    const result = await courseService.deleteCourse(id, userId, userRole);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
    });
  });

  // Enroll in course
  enrollInCourse = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const { id } = req.params;
    const result = await courseService.enrollInCourse(userId, id);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Enrolled in course successfully',
      data: result,
    });
  });

  // Get my enrollments
  getMyEnrollments = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await courseService.getUserEnrollments(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Enrollments retrieved successfully',
      data: result,
    });
  });

  // Update enrollment progress
  updateProgress = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const { courseId, lessonId } = req.body;
    const result = await courseService.updateEnrollmentProgress(userId, courseId, lessonId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Progress updated successfully',
      data: result,
    });
  });

  // Get course statistics
  getCourseStatistics = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await courseService.getCourseStatistics(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Course statistics retrieved successfully',
      data: result,
    });
  });

  // Get instructor's courses
  getInstructorCourses = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await courseService.getInstructorCourses(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Instructor courses retrieved successfully',
      data: result,
    });
  });

  // Get instructor analytics
  getInstructorAnalytics = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await courseService.getInstructorAnalytics(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Instructor analytics retrieved successfully',
      data: result,
    });
  });

  // Get course students
  getCourseStudents = catchAsync(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const userId = req.user?.userId as string;
    const userRole = req.user?.role as string;
    const result = await courseService.getCourseStudents(courseId, userId, userRole);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Course students retrieved successfully',
      data: result,
    });
  });
}

export default new CourseController();

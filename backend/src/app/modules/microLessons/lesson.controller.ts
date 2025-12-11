import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import ApiError from '../../../utils/ApiError';
import lessonService from './lesson.service';

class LessonController {
  // Create a new lesson
  createLesson = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await lessonService.createLesson(userId, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Lesson created successfully',
      data: result,
    });
  });

  // Generate AI lesson
  generateLesson = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await lessonService.generateLesson(userId, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'AI lesson generated successfully',
      data: result,
    });
  });

  // Get all lessons with filters
  getLessons = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = req.user?.userId;

    const result = await lessonService.getLessons(req.query, page, limit, userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Lessons retrieved successfully',
      data: result.lessons,
      meta: result.pagination,
    });
  });

  // Get lesson by ID or slug
  getLessonById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const result = await lessonService.getLessonById(id, userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Lesson retrieved successfully',
      data: result,
    });
  });

  // Update lesson
  updateLesson = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId as string;
    const userRole = req.user?.role as string;
    const result = await lessonService.updateLesson(id, userId, req.body, userRole);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Lesson updated successfully',
      data: result,
    });
  });

  // Delete lesson
  deleteLesson = catchAsync(async (req: Request, res: Response) => {
    console.log('🎯 DELETE Controller Hit:', {
      id: req.params.id,
      userId: req.user?.userId,
      userRole: req.user?.role,
      path: req.path,
      method: req.method
    });

    const { id } = req.params;
    const userId = req.user?.userId as string;
    const userRole = req.user?.role as string;
    const result = await lessonService.deleteLesson(id, userId, userRole);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
    });
  });

  // Like lesson
  likeLesson = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId as string;
    const result = await lessonService.likeLesson(id, userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.hasLiked ? 'Lesson liked successfully' : 'Like removed successfully',
      data: result,
    });
  });

  // Complete lesson
  completeLesson = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;


    if (!userId) {
      throw new ApiError(401, 'User not authenticated');
    }

    const result = await lessonService.completeLesson(id, userId);


    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Lesson completed! +${result.xpEarned} XP earned`,
      data: result,
    });
  });

  // Get trending lessons
  getTrendingLessons = catchAsync(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await lessonService.getTrendingLessons(limit);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Trending lessons retrieved successfully',
      data: result,
    });
  });

  // Get recommended lessons
  getRecommendedLessons = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await lessonService.getRecommendedLessons(userId, limit);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Recommended lessons retrieved successfully',
      data: result,
    });
  });

  // Get instructor's lessons
  getInstructorLessons = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await lessonService.getInstructorLessons(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Instructor lessons retrieved successfully',
      data: result,
    });
  });

  // Get instructor lesson analytics
  getInstructorLessonAnalytics = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await lessonService.getInstructorLessonAnalytics(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Instructor lesson analytics retrieved successfully',
      data: result,
    });
  });

  // Check if lesson is unlocked for user
  checkLessonAccess = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId as string;
    const result = await lessonService.checkLessonAccess(id, userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Lesson access status retrieved',
      data: result,
    });
  });
}

export default new LessonController();

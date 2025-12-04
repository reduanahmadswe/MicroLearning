import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import quizService from './quiz.service';

class QuizController {
  // Create quiz
  createQuiz = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await quizService.createQuiz(userId, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Quiz created successfully',
      data: result,
    });
  });

  // Generate AI quiz
  generateQuiz = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await quizService.generateQuiz(userId, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Quiz generated successfully',
      data: result,
    });
  });

  // Get quizzes
  getQuizzes = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await quizService.getQuizzes(req.query, page, limit);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Quizzes retrieved successfully',
      data: result.quizzes,
      meta: result.pagination,
    });
  });

  // Get quiz by ID
  getQuizById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const result = await quizService.getQuizById(id, userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Quiz retrieved successfully',
      data: result,
    });
  });

  // Get quiz by lesson ID
  getQuizByLesson = catchAsync(async (req: Request, res: Response) => {
    const { lessonId } = req.params;
    const result = await quizService.getQuizByLesson(lessonId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Quiz retrieved successfully',
      data: result,
    });
  });

  // Get quiz attempts
  getQuizAttempts = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId as string;
    const result = await quizService.getQuizAttempts(id, userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Quiz attempts retrieved successfully',
      data: result,
    });
  });

  // Submit quiz
  submitQuiz = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await quizService.submitQuiz(userId, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Quiz submitted successfully',
      data: result,
    });
  });

  // Get user attempts
  getUserAttempts = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await quizService.getUserAttempts(userId, page, limit);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Quiz attempts retrieved successfully',
      data: result.attempts,
      meta: result.pagination,
    });
  });

  // Get attempt details
  getAttemptDetails = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId as string;
    const result = await quizService.getAttemptDetails(id, userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Attempt details retrieved successfully',
      data: result,
    });
  });

  // Get instructor's quizzes
  getInstructorQuizzes = catchAsync(async (req: Request, res: Response) => {
    console.log('📥 GET /api/quiz/instructor request received');
    console.log('👤 User from token:', req.user);
    
    const userId = req.user?.userId as string;
    console.log('🔑 Instructor userId:', userId);
    
    const result = await quizService.getInstructorQuizzes(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Instructor quizzes retrieved successfully',
      data: result,
    });
  });

  // Update quiz
  updateQuiz = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId as string;
    const result = await quizService.updateQuiz(id, userId, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Quiz updated successfully',
      data: result,
    });
  });

  // Delete quiz
  deleteQuiz = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId as string;
    await quizService.deleteQuiz(id, userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Quiz deleted successfully',
      data: null,
    });
  });

  // Duplicate quiz
  duplicateQuiz = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId as string;
    const result = await quizService.duplicateQuiz(id, userId);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Quiz duplicated successfully',
      data: result,
    });
  });

  // Toggle publish status
  togglePublish = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId as string;
    const result = await quizService.togglePublish(id, userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Quiz publish status updated successfully',
      data: result,
    });
  });

  // Get quiz results (attempts)
  getQuizResults = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId as string;
    const result = await quizService.getQuizResults(id, userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Quiz results retrieved successfully',
      data: result,
    });
  });
}

export default new QuizController();

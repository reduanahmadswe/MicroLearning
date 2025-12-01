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
}

export default new QuizController();

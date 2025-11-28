import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import flashcardService from './flashcard.service';

class FlashcardController {
  // Create flashcard
  createFlashcard = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await flashcardService.createFlashcard(userId, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Flashcard created successfully',
      data: result,
    });
  });

  // Generate flashcards
  generateFlashcards = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await flashcardService.generateFlashcards(userId, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Flashcards generated successfully',
      data: result,
    });
  });

  // Get flashcards
  getFlashcards = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await flashcardService.getFlashcards(userId, req.query, page, limit);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Flashcards retrieved successfully',
      data: result.flashcards,
      meta: result.pagination,
    });
  });

  // Get due flashcards
  getDueFlashcards = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await flashcardService.getDueFlashcards(userId, limit);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Due flashcards retrieved successfully',
      data: result,
    });
  });

  // Review flashcard
  reviewFlashcard = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await flashcardService.reviewFlashcard(userId, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Flashcard reviewed successfully',
      data: result,
    });
  });

  // Get statistics
  getFlashcardStats = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await flashcardService.getFlashcardStats(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Flashcard statistics retrieved successfully',
      data: result,
    });
  });

  // Delete flashcard
  deleteFlashcard = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId as string;
    await flashcardService.deleteFlashcard(id, userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Flashcard deleted successfully',
    });
  });
}

export default new FlashcardController();

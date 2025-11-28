import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import bookmarkService from './bookmark.service';

class BookmarkController {
  // Add bookmark
  addBookmark = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await bookmarkService.addBookmark(userId, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Bookmark added successfully',
      data: result,
    });
  });

  // Remove bookmark
  removeBookmark = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const { lessonId } = req.params;
    await bookmarkService.removeBookmark(userId, lessonId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Bookmark removed successfully',
    });
  });

  // Get user's bookmarks
  getUserBookmarks = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await bookmarkService.getUserBookmarks(userId, req.query, page, limit);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Bookmarks retrieved successfully',
      data: result.bookmarks,
      meta: result.pagination,
    });
  });

  // Get bookmark by lesson
  getBookmarkByLesson = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const { lessonId } = req.params;
    const result = await bookmarkService.getBookmarkByLesson(userId, lessonId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result ? 'Bookmark found' : 'Lesson not bookmarked',
      data: result,
    });
  });

  // Update bookmark
  updateBookmark = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const { lessonId } = req.params;
    const result = await bookmarkService.updateBookmark(userId, lessonId, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Bookmark updated successfully',
      data: result,
    });
  });

  // Get collections
  getCollections = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await bookmarkService.getCollections(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Collections retrieved successfully',
      data: result,
    });
  });

  // Check if lesson is bookmarked
  checkBookmark = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const { lessonId } = req.params;
    const result = await bookmarkService.isLessonBookmarked(userId, lessonId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Bookmark status retrieved',
      data: { isBookmarked: result },
    });
  });

  // Get bookmark statistics
  getBookmarkStats = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await bookmarkService.getBookmarkStats(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Bookmark statistics retrieved successfully',
      data: result,
    });
  });
}

export default new BookmarkController();

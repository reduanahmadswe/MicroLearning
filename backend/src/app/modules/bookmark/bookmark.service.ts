import ApiError from '../../../utils/ApiError';
import Bookmark from './bookmark.model';
import Lesson from '../microLessons/lesson.model';
import { IAddBookmarkRequest, IUpdateBookmarkRequest } from './bookmark.types';

class BookmarkService {
  // Add bookmark
  async addBookmark(userId: string, bookmarkData: IAddBookmarkRequest) {
    const { lessonId, collection = 'Default', notes } = bookmarkData;

    // Check if lesson exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new ApiError(404, 'Lesson not found');
    }

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({
      user: userId,
      lesson: lessonId,
    });

    if (existingBookmark) {
      throw new ApiError(400, 'Lesson already bookmarked');
    }

    // Create bookmark
    const bookmark = await Bookmark.create({
      user: userId,
      lesson: lessonId,
      collection,
      notes,
    });

    return await bookmark.populate('lesson', 'title topic difficulty duration isPremium');
  }

  // Remove bookmark
  async removeBookmark(userId: string, lessonId: string) {
    const bookmark = await Bookmark.findOneAndDelete({
      user: userId,
      lesson: lessonId,
    });

    if (!bookmark) {
      throw new ApiError(404, 'Bookmark not found');
    }

    return bookmark;
  }

  // Get user's bookmarks
  async getUserBookmarks(userId: string, filters: any, page: number, limit: number) {
    const query: any = { user: userId };

    if (filters.collection) {
      query.collection = filters.collection;
    }

    const skip = (page - 1) * limit;

    const [bookmarks, total] = await Promise.all([
      Bookmark.find(query)
        .populate('lesson', 'title topic difficulty duration isPremium slug thumbnail')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Bookmark.countDocuments(query),
    ]);

    return {
      bookmarks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get bookmark by lesson
  async getBookmarkByLesson(userId: string, lessonId: string) {
    const bookmark = await Bookmark.findOne({
      user: userId,
      lesson: lessonId,
    }).populate('lesson', 'title topic difficulty duration isPremium');

    return bookmark;
  }

  // Update bookmark
  async updateBookmark(
    userId: string,
    lessonId: string,
    updateData: IUpdateBookmarkRequest
  ) {
    const bookmark = await Bookmark.findOneAndUpdate(
      {
        user: userId,
        lesson: lessonId,
      },
      updateData,
      { new: true }
    ).populate('lesson', 'title topic difficulty duration isPremium');

    if (!bookmark) {
      throw new ApiError(404, 'Bookmark not found');
    }

    return bookmark;
  }

  // Get all collections
  async getCollections(userId: string) {
    const collections = await Bookmark.aggregate([
      { $match: { user: new Bookmark().user.constructor(userId) } },
      {
        $group: {
          _id: '$collection',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1,
        },
      },
      { $sort: { name: 1 } },
    ]);

    return collections;
  }

  // Check if lesson is bookmarked
  async isLessonBookmarked(userId: string, lessonId: string): Promise<boolean> {
    const bookmark = await Bookmark.findOne({
      user: userId,
      lesson: lessonId,
    });

    return !!bookmark;
  }

  // Get bookmark statistics
  async getBookmarkStats(userId: string) {
    const [total, collectionsCount] = await Promise.all([
      Bookmark.countDocuments({ user: userId }),
      Bookmark.distinct('collection', { user: userId }).then((cols) => cols.length),
    ]);

    return {
      totalBookmarks: total,
      collectionsCount,
    };
  }
}

export default new BookmarkService();

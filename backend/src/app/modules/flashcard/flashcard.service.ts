import ApiError from '../../../utils/ApiError';
import Flashcard from './flashcard.model';
import Lesson from '../microLessons/lesson.model';
import User from '../auth/auth.model';
import {
  ICreateFlashcardRequest,
  IReviewFlashcardRequest,
  IGenerateFlashcardsRequest,
  ISRSResult,
} from './flashcard.types';

class FlashcardService {
  // Create flashcard
  async createFlashcard(userId: string, flashcardData: ICreateFlashcardRequest) {
    const flashcard = await Flashcard.create({
      ...flashcardData,
      user: userId,
    });

    return flashcard;
  }

  // Generate flashcards from lesson (AI placeholder)
  async generateFlashcards(userId: string, generateData: IGenerateFlashcardsRequest) {
    const { lessonId, count = 10 } = generateData;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new ApiError(404, 'Lesson not found');
    }

    // TODO: Integrate with AI to generate flashcards from lesson content
    // For now, creating template flashcards
    const flashcards = [];
    for (let i = 0; i < count; i++) {
      const flashcard = await Flashcard.create({
        front: `Question ${i + 1} about ${lesson.topic}?`,
        back: `Answer ${i + 1} explaining the concept from ${lesson.title}`,
        hint: `Think about ${lesson.topic}`,
        lesson: lessonId,
        topic: lesson.topic,
        user: userId,
        isPublic: false,
      });
      flashcards.push(flashcard);
    }

    return flashcards;
  }

  // Get user's flashcards
  async getFlashcards(userId: string, filters: any, page: number, limit: number) {
    const query: any = { user: userId };

    if (filters.topic) {
      query.topic = { $regex: filters.topic, $options: 'i' };
    }

    if (filters.lesson) {
      query.lesson = filters.lesson;
    }

    const skip = (page - 1) * limit;

    const [flashcards, total] = await Promise.all([
      Flashcard.find(query)
        .populate('lesson', 'title topic')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Flashcard.countDocuments(query),
    ]);

    return {
      flashcards,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get due flashcards for review
  async getDueFlashcards(userId: string, limit: number = 20) {
    const now = new Date();

    const flashcards = await Flashcard.find({
      user: userId,
      nextReviewDate: { $lte: now },
    })
      .populate('lesson', 'title topic')
      .sort({ nextReviewDate: 1 })
      .limit(limit)
      .lean();

    return flashcards;
  }

  // Review flashcard with SM-2 algorithm
  async reviewFlashcard(userId: string, reviewData: IReviewFlashcardRequest) {
    const { flashcardId, quality } = reviewData;

    const flashcard = await Flashcard.findOne({
      _id: flashcardId,
      user: userId,
    });

    if (!flashcard) {
      throw new ApiError(404, 'Flashcard not found');
    }

    // Apply SM-2 algorithm
    const srsResult = this.calculateSM2(
      flashcard.easeFactor,
      flashcard.interval,
      flashcard.repetitions,
      quality
    );

    // Update flashcard
    flashcard.easeFactor = srsResult.easeFactor;
    flashcard.interval = srsResult.interval;
    flashcard.repetitions = srsResult.repetitions;
    flashcard.nextReviewDate = srsResult.nextReviewDate;
    flashcard.lastReviewedAt = new Date();
    await flashcard.save();

    // Award XP for review
    await this.awardReviewXP(userId, quality);

    return {
      flashcard,
      srsResult,
    };
  }

  // Get flashcard statistics
  async getFlashcardStats(userId: string) {
    const now = new Date();

    const [total, dueCount, masteredCount] = await Promise.all([
      Flashcard.countDocuments({ user: userId }),
      Flashcard.countDocuments({
        user: userId,
        nextReviewDate: { $lte: now },
      }),
      Flashcard.countDocuments({
        user: userId,
        repetitions: { $gte: 5 },
        easeFactor: { $gte: 2.5 },
      }),
    ]);

    const averageEaseFactor = await Flashcard.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          avgEase: { $avg: '$easeFactor' },
        },
      },
    ]);

    return {
      total,
      dueCount,
      masteredCount,
      averageEaseFactor: averageEaseFactor[0]?.avgEase || 2.5,
    };
  }

  // Delete flashcard
  async deleteFlashcard(flashcardId: string, userId: string) {
    const flashcard = await Flashcard.findOneAndDelete({
      _id: flashcardId,
      user: userId,
    });

    if (!flashcard) {
      throw new ApiError(404, 'Flashcard not found');
    }

    return flashcard;
  }

  // SM-2 Algorithm Implementation
  private calculateSM2(
    easeFactor: number,
    interval: number,
    repetitions: number,
    quality: number
  ): ISRSResult {
    let newEaseFactor = easeFactor;
    let newInterval = interval;
    let newRepetitions = repetitions;

    // Quality: 0-5
    // 0 = Complete blackout
    // 1 = Incorrect response, correct one remembered
    // 2 = Incorrect response, correct one seemed easy to recall
    // 3 = Correct response recalled with serious difficulty
    // 4 = Correct response after some hesitation
    // 5 = Perfect response

    if (quality >= 3) {
      // Correct response
      if (newRepetitions === 0) {
        newInterval = 1; // 1 day
      } else if (newRepetitions === 1) {
        newInterval = 6; // 6 days
      } else {
        newInterval = Math.round(newInterval * newEaseFactor);
      }
      newRepetitions += 1;
    } else {
      // Incorrect response - reset
      newRepetitions = 0;
      newInterval = 1;
    }

    // Update ease factor
    newEaseFactor = newEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // Ease factor should not go below 1.3
    if (newEaseFactor < 1.3) {
      newEaseFactor = 1.3;
    }

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return {
      easeFactor: parseFloat(newEaseFactor.toFixed(2)),
      interval: newInterval,
      repetitions: newRepetitions,
      nextReviewDate,
    };
  }

  // Award XP for flashcard review
  private async awardReviewXP(userId: string, quality: number) {
    const user = await User.findById(userId);
    if (!user) return;

    // XP based on quality: 1-5 XP
    const xpToAward = quality;
    user.xp += xpToAward;
    user.level = Math.floor(user.xp / 100) + 1;

    await user.save();
  }
}

export default new FlashcardService();

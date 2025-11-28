import ApiError from '../../../utils/ApiError';
import Lesson from './lesson.model';
import {
  ICreateLessonRequest,
  IGenerateLessonRequest,
  ILessonFilterQuery,
} from './lesson.types';

class LessonService {
  // Create a new lesson
  async createLesson(userId: string, lessonData: ICreateLessonRequest) {
    const lesson = await Lesson.create({
      ...lessonData,
      author: userId,
      aiGenerated: false,
    });

    return lesson;
  }

  // Generate AI lesson (placeholder - integrate with AI service later)
  async generateLesson(userId: string, generateData: IGenerateLessonRequest) {
    // TODO: Integrate with OpenAI/Claude API to generate content
    // For now, creating a template lesson
    
    const aiContent = {
      title: `Introduction to ${generateData.topic}`,
      description: `A ${generateData.estimatedTime}-minute micro-lesson on ${generateData.topic}`,
      content: `# ${generateData.topic}\n\nThis is an AI-generated lesson about ${generateData.topic}.\n\n## Key Concepts\n\n- Concept 1\n- Concept 2\n- Concept 3\n\n## Summary\n\nIn this lesson, you learned the basics of ${generateData.topic}.`,
      keyPoints: [
        `Understanding ${generateData.topic}`,
        'Key principles and concepts',
        'Practical applications',
      ],
      aiSummary: `Quick overview of ${generateData.topic} fundamentals`,
    };

    const lesson = await Lesson.create({
      title: aiContent.title,
      description: aiContent.description,
      content: aiContent.content,
      topic: generateData.topic,
      difficulty: generateData.difficulty,
      estimatedTime: generateData.estimatedTime || 2,
      keyPoints: aiContent.keyPoints,
      aiSummary: aiContent.aiSummary,
      aiGenerated: true,
      author: userId,
      tags: [generateData.topic.toLowerCase()],
      isPublished: true,
    });

    return lesson;
  }

  // Get lessons with filters and pagination
  async getLessons(filters: ILessonFilterQuery, page: number, limit: number) {
    const query: any = { isPublished: true };

    // Apply filters
    if (filters.topic) {
      query.topic = { $regex: filters.topic, $options: 'i' };
    }

    if (filters.difficulty) {
      query.difficulty = filters.difficulty;
    }

    if (filters.duration) {
      const [min, max] = filters.duration.split('-').map(Number);
      query.estimatedTime = { $gte: min, $lte: max };
    }

    if (filters.tags) {
      const tagArray = filters.tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    if (filters.isPremium) {
      query.isPremium = filters.isPremium === 'true';
    }

    if (filters.author) {
      query.author = filters.author;
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const skip = (page - 1) * limit;

    const [lessons, total] = await Promise.all([
      Lesson.find(query)
        .populate('author', 'name email profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Lesson.countDocuments(query),
    ]);

    return {
      lessons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get lesson by ID or slug
  async getLessonById(identifier: string, userId?: string) {
    const lesson = await Lesson.findOne({
      $or: [{ _id: identifier }, { slug: identifier }],
    }).populate('author', 'name email profilePicture bio');

    if (!lesson) {
      throw new ApiError(404, 'Lesson not found');
    }

    // Check if user has access (premium check)
    if (lesson.isPremium && userId) {
      // TODO: Check if user is premium
      // For now, allowing access
    }

    // Increment views
    lesson.views += 1;
    await lesson.save();

    return lesson;
  }

  // Update lesson
  async updateLesson(lessonId: string, userId: string, updateData: Partial<ICreateLessonRequest>) {
    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      throw new ApiError(404, 'Lesson not found');
    }

    // Check if user is the author
    if (lesson.author.toString() !== userId) {
      throw new ApiError(403, 'You are not authorized to update this lesson');
    }

    Object.assign(lesson, updateData);
    await lesson.save();

    return lesson;
  }

  // Delete lesson
  async deleteLesson(lessonId: string, userId: string, userRole: string) {
    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      throw new ApiError(404, 'Lesson not found');
    }

    // Check if user is the author or admin
    if (lesson.author.toString() !== userId && userRole !== 'admin') {
      throw new ApiError(403, 'You are not authorized to delete this lesson');
    }

    await lesson.deleteOne();

    return { message: 'Lesson deleted successfully' };
  }

  // Like lesson
  async likeLesson(lessonId: string) {
    const lesson = await Lesson.findByIdAndUpdate(
      lessonId,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!lesson) {
      throw new ApiError(404, 'Lesson not found');
    }

    return lesson;
  }

  // Mark lesson as completed
  async completeLesson(lessonId: string) {
    const lesson = await Lesson.findByIdAndUpdate(
      lessonId,
      { $inc: { completions: 1 } },
      { new: true }
    );

    if (!lesson) {
      throw new ApiError(404, 'Lesson not found');
    }

    return lesson;
  }

  // Get trending lessons
  async getTrendingLessons(limit: number = 10) {
    const lessons = await Lesson.find({ isPublished: true })
      .populate('author', 'name profilePicture')
      .sort({ views: -1, likes: -1, completions: -1 })
      .limit(limit)
      .lean();

    return lessons;
  }

  // Get recommended lessons based on user preferences
  async getRecommendedLessons(userId: string, limit: number = 10) {
    // TODO: Implement AI-based recommendations
    // For now, returning popular lessons in user's preferred topics
    
    const lessons = await Lesson.find({ isPublished: true })
      .populate('author', 'name profilePicture')
      .sort({ completions: -1, likes: -1 })
      .limit(limit)
      .lean();

    return lessons;
  }
}

export default new LessonService();

import ApiError from '../../../utils/ApiError';
import Lesson from './lesson.model';
import User from '../auth/auth.model';
import UserProgress from '../progressTracking/progress.model';
import { Quiz } from '../quiz/quiz.model';
import {
  ICreateLessonRequest,
  IGenerateLessonRequest,
  ILessonFilterQuery,
} from './lesson.types';

class LessonService {
  // Create a new lesson
  async createLesson(userId: string, lessonData: any) {
    // Verify course exists
    const { Course } = require('../course/course.model');
    const course = await Course.findById(lessonData.course);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    // Check if user is course author or admin
    if (course.author.toString() !== userId) {
      const user = await User.findById(userId);
      if (user?.role !== 'admin') {
        throw new ApiError(403, 'You can only create lessons for your own courses');
      }
    }

    // Auto-assign order if not provided
    let order = lessonData.order;
    if (!order) {
      const lastLesson = await Lesson.findOne({ course: lessonData.course })
        .sort({ order: -1 })
        .select('order');
      order = lastLesson ? lastLesson.order + 1 : 1;
    }

    // Create the lesson
    const lesson = await Lesson.create({
      title: lessonData.title,
      description: lessonData.description || lessonData.content?.substring(0, 200),
      content: lessonData.content,
      topic: lessonData.topic,
      tags: lessonData.tags || [],
      difficulty: lessonData.difficulty,
      estimatedTime: lessonData.estimatedTime,
      course: lessonData.course,
      order: order,
      author: userId,
      aiGenerated: false,
      isPublished: true, // Auto-publish lessons created by instructors
      media: lessonData.videoUrl ? [{
        type: 'video',
        url: lessonData.videoUrl,
        title: `${lessonData.title} - Video`,
      }] : [],
    });

    // Create quiz if questions provided
    if (lessonData.quizQuestions && lessonData.quizQuestions.length > 0) {
      const quizData = {
        title: `${lessonData.title} - Quiz`,
        description: `Test your knowledge on ${lessonData.title}`,
        lesson: lesson._id,
        difficulty: lessonData.difficulty,
        passingScore: lessonData.passingScore || 70,
        questions: lessonData.quizQuestions.map((q: any) => ({
          question: q.question,
          type: 'mcq',
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          points: 10,
        })),
      };

      await Quiz.create(quizData);
    }

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
  async getLessons(filters: ILessonFilterQuery, page: number, limit: number, userId?: string) {
    const query: any = {};

    console.log('🔍 getLessons called with:', { filters, userId });

    // Check if user is author of the course (for viewing unpublished lessons)
    let isOwnCourse = false;
    if (filters.course && userId) {
      const { Course } = require('../course/course.model');
      const course = await Course.findById(filters.course);
      console.log('📚 Course found:', course ? `Yes (author: ${course.author})` : 'No');
      console.log('👤 User ID:', userId);
      if (course && course.author.toString() === userId) {
        isOwnCourse = true;
        console.log('✅ User is course author - showing all lessons');
      }
    }

    // Only show published lessons unless it's the course author viewing their own lessons
    if (!isOwnCourse) {
      query.isPublished = true;
      console.log('🔒 Not own course - filtering by isPublished: true');
    }

    // Apply filters
    if (filters.course) {
      query.course = filters.course;
    }

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

    console.log('🔎 Final MongoDB query:', JSON.stringify(query));
    console.log('📄 Pagination:', { page, limit, skip });

    const [lessons, total] = await Promise.all([
      Lesson.find(query)
        .populate('author', 'name email profilePicture')
        .populate('course', 'title description')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Lesson.countDocuments(query),
    ]);

    console.log('✅ Found lessons:', lessons.length, 'Total:', total);

    // Check completion status for each lesson if userId provided
    if (userId) {
      const lessonIds = lessons.map((l: any) => l._id);
      const progressRecords = await UserProgress.find({ 
        user: userId, 
        lesson: { $in: lessonIds },
        status: 'completed'
      }).lean();
      const completedLessonIds = progressRecords.map((p) => p.lesson.toString());
      
      const lessonsWithStatus = lessons.map((lesson: any) => ({
        ...lesson,
        isCompleted: completedLessonIds.includes(lesson._id.toString()),
      }));

      return {
        lessons: lessonsWithStatus,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

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

    // Check if user has completed this lesson by checking enrollment
    let isCompleted = false;
    if (userId && lesson.course) {
      try {
        const Enrollment = require('../enrollment/enrollment.model').default;
        const enrollment = await Enrollment.findOne({
          user: userId,
          course: lesson.course,
        }).lean();
        
        if (enrollment && enrollment.completedLessons) {
          isCompleted = enrollment.completedLessons.some(
            (id: any) => id.toString() === lesson._id.toString()
          );
        }
        
        console.log(`📖 Lesson ${lesson._id} completed status for user ${userId}:`, isCompleted);
      } catch (error) {
        console.error('Error checking lesson completion:', error);
      }
    }

    return {
      ...lesson.toObject(),
      isCompleted,
    };
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
  async completeLesson(lessonId: string, userId: string) {
    console.log('Service - Complete lesson:', { lessonId, userId });
    
    const lesson = await Lesson.findByIdAndUpdate(
      lessonId,
      { $inc: { completions: 1 } },
      { new: true }
    ).populate('course');

    if (!lesson) {
      console.error('Lesson not found:', lessonId);
      throw new ApiError(404, 'Lesson not found');
    }

    console.log('Lesson found, awarding XP to user:', userId);

    // Award XP to user
    const xpAmount = 50;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $inc: { 
          xp: xpAmount
        } 
      },
      { new: true }
    );

    if (!updatedUser) {
      console.error('User not found:', userId);
      throw new ApiError(404, 'User not found');
    }

    console.log('User XP updated:', { oldXP: updatedUser.xp - xpAmount, newXP: updatedUser.xp });

    // Update user progress
    const progress = await UserProgress.findOneAndUpdate(
      { user: userId },
      {
        $inc: { 
          totalXP: xpAmount,
          lessonsCompleted: 1 
        },
        $addToSet: { completedLessons: lessonId }
      },
      { upsert: true, new: true }
    );

    console.log('Progress updated:', progress);
    console.log('📚 Lesson.course exists?', !!lesson.course);
    console.log('📚 Lesson.course value:', lesson.course);

    // Update course enrollment progress if lesson belongs to a course
    if (lesson.course) {
      console.log('✅ Entering enrollment update block');
      try {
        const { Enrollment } = require('../course/course.model');
        const courseId = typeof lesson.course === 'object' ? lesson.course._id : lesson.course;
        
        console.log('🔍 Looking for enrollment - User:', userId, 'Course:', courseId);
        
        const enrollment = await Enrollment.findOne({
          user: userId,
          course: courseId,
        });

        console.log('📝 Enrollment found:', enrollment ? 'Yes' : 'No');
        if (!enrollment) {
          console.error('❌ NO ENROLLMENT FOUND! User must enroll in course first.');
          return { 
            lesson, 
            xpEarned: xpAmount,
            totalXP: updatedUser.xp,
            level: updatedUser.level
          };
        }
        console.log('📝 Current completedLessons:', enrollment?.completedLessons);

        if (enrollment) {
          // Add lesson to completed if not already there
          const alreadyCompleted = enrollment.completedLessons.some((id: any) => id.toString() === lessonId);
          console.log('📝 Already completed?', alreadyCompleted);
          
          if (!alreadyCompleted) {
            enrollment.completedLessons.push(lessonId);
            console.log('✅ Added lesson to completedLessons:', lessonId);
          }

          // Update last accessed lesson
          enrollment.lastAccessedLesson = lessonId;

          // Calculate progress based on actual lessons in database
          const totalLessons = await Lesson.countDocuments({ course: courseId, isPublished: true });
          const completedLessons = enrollment.completedLessons.length;
          enrollment.progress = Math.round((completedLessons / totalLessons) * 100);

          console.log('📊 Enrollment progress:', { 
            completedLessons, 
            totalLessons, 
            progress: enrollment.progress 
          });

          // Check if course is 100% complete
          if (enrollment.progress === 100 && !enrollment.completedAt) {
            enrollment.completedAt = new Date();

            // Award bonus XP for course completion
            updatedUser.xp += 200;
            const newLevel = Math.floor(updatedUser.xp / 100) + 1;
            if (newLevel > updatedUser.level) {
              updatedUser.level = newLevel;
            }
            await updatedUser.save();

            // Generate certificate for course completion
            await this.generateCourseCertificate(userId, courseId.toString());
            
            console.log('🎓 Course completed! Certificate generated.');
          }

          await enrollment.save();
          console.log('💾 Enrollment saved! completedLessons:', enrollment.completedLessons);
        }
      } catch (error) {
        console.error('Error updating enrollment:', error);
        // Don't throw error, just log it
      }
    }

    return { 
      lesson, 
      xpEarned: xpAmount,
      totalXP: updatedUser.xp,
      level: updatedUser.level
    };
  }

  // Generate certificate for course completion
  private async generateCourseCertificate(userId: string, courseId: string) {
    try {
      const Certificate = require('../certificate/certificate.model').default;
      const Course = require('../course/course.model').default;

      // Check if certificate already exists
      const existingCertificate = await Certificate.findOne({
        user: userId,
        course: courseId,
      });

      if (existingCertificate) {
        return existingCertificate;
      }

      const course = await Course.findById(courseId).populate('author', 'name');
      if (!course) {
        console.error('Course not found for certificate:', courseId);
        return;
      }

      // Generate unique certificate ID
      const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
      const verificationCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      const certificate = await Certificate.create({
        user: userId,
        course: courseId,
        certificateId,
        verificationCode,
        issueDate: new Date(),
        instructorName: course.author?.name || 'Unknown Instructor',
      });

      console.log('Certificate created:', certificateId);
      return certificate;
    } catch (error) {
      console.error('Error generating certificate:', error);
      // Don't throw, just log
    }
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
  async getRecommendedLessons(_userId: string, limit: number = 10) {
    // TODO: Implement AI-based recommendations
    // For now, returning popular lessons in user's preferred topics
    
    const lessons = await Lesson.find({ isPublished: true })
      .populate('author', 'name profilePicture')
      .sort({ completions: -1, likes: -1 })
      .limit(limit)
      .lean();

    return lessons;
  }

  // Get instructor's lessons
  async getInstructorLessons(userId: string) {
    const lessons = await Lesson.find({ author: userId })
      .populate('author', 'name profilePicture')
      .sort({ createdAt: -1 })
      .lean();

    return lessons;
  }

  // Get instructor lesson analytics
  async getInstructorLessonAnalytics(userId: string) {
    const lessons = await Lesson.find({ author: userId }).lean();
    
    const totalLessons = lessons.length;
    const totalViews = lessons.reduce((sum, lesson) => sum + (lesson.views || 0), 0);
    const totalLikes = lessons.reduce((sum, lesson) => sum + (lesson.likes || 0), 0);
    const totalCompletions = lessons.reduce((sum, lesson) => sum + (lesson.completions || 0), 0);
    
    // Get completion rate
    const completionRate = totalViews > 0 ? (totalCompletions / totalViews) * 100 : 0;
    
    // Get lessons by difficulty
    const byDifficulty = lessons.reduce((acc: any, lesson) => {
      acc[lesson.difficulty] = (acc[lesson.difficulty] || 0) + 1;
      return acc;
    }, {});
    
    // Top performing lessons
    const topLessons = lessons
      .sort((a, b) => (b.completions || 0) - (a.completions || 0))
      .slice(0, 5)
      .map(lesson => ({
        id: lesson._id,
        title: lesson.title,
        views: lesson.views || 0,
        completions: lesson.completions || 0,
        likes: lesson.likes || 0,
      }));

    return {
      totalLessons,
      totalViews,
      totalLikes,
      totalCompletions,
      completionRate: Math.round(completionRate),
      byDifficulty,
      topLessons,
    };
  }

  // Check if lesson is unlocked for user
  async checkLessonAccess(lessonId: string, userId: string) {
    const lesson = await Lesson.findById(lessonId);
    
    if (!lesson) {
      throw new ApiError(404, 'Lesson not found');
    }

    // If lesson is not part of a course, it's always accessible
    if (!lesson.course) {
      return {
        isUnlocked: true,
        requiresPayment: lesson.isPremium,
        message: 'Lesson is accessible',
      };
    }

    // Import models
    const { Course, Enrollment } = require('../course/course.model');
    const { QuizAttempt } = require('../quiz/quiz.model');

    // Get course
    const course = await Course.findById(lesson.course).lean();
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: lesson.course,
    }).lean();

    if (!enrollment) {
      return {
        isUnlocked: false,
        requiresEnrollment: true,
        requiresPayment: course.isPremium && course.price > 0,
        courseName: course.title,
        message: 'You must enroll in the course first',
      };
    }

    // Find lesson's order in course
    const lessonInCourse = course.lessons.find(
      (l: any) => l.lesson.toString() === lessonId
    );

    if (!lessonInCourse) {
      throw new ApiError(400, 'Lesson is not part of this course');
    }

    // First lesson (order 1) is always unlocked
    if (lessonInCourse.order === 1) {
      return {
        isUnlocked: true,
        message: 'First lesson is always unlocked',
      };
    }

    // Check if previous lesson is completed
    const previousLessonOrder = lessonInCourse.order - 1;
    const previousLesson = course.lessons.find((l: any) => l.order === previousLessonOrder);

    if (!previousLesson) {
      return {
        isUnlocked: false,
        message: 'Previous lesson not found',
      };
    }

    const isPreviousCompleted = enrollment.completedLessons.some(
      (id: any) => id.toString() === previousLesson.lesson.toString()
    );

    if (!isPreviousCompleted) {
      // Get previous lesson details
      const prevLessonData = await Lesson.findById(previousLesson.lesson).lean();
      
      return {
        isUnlocked: false,
        requiresPreviousCompletion: true,
        previousLessonTitle: prevLessonData?.title || 'Previous Lesson',
        requiredQuizScore: prevLessonData?.requiredQuizScore || 80,
        message: `Complete the previous lesson and pass its quiz (${prevLessonData?.requiredQuizScore || 80}%+) to unlock this lesson`,
      };
    }

    return {
      isUnlocked: true,
      message: 'Lesson is unlocked',
    };
  }
}

export default new LessonService();

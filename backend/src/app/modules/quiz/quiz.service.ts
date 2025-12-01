import ApiError from '../../../utils/ApiError';
import { Quiz, QuizAttempt } from './quiz.model';
import User from '../auth/auth.model';
import Lesson from '../microLessons/lesson.model';
import { Course, Enrollment } from '../course/course.model';
import {
  ICreateQuizRequest,
  IGenerateQuizRequest,
  ISubmitQuizRequest,
} from './quiz.types';

class QuizService {
  // Create quiz
  async createQuiz(userId: string, quizData: ICreateQuizRequest) {
    // Verify course exists
    const { Course } = require('../course/course.model');
    const course = await Course.findById((quizData as any).course);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    // Verify lesson exists and belongs to the course
    const lesson = await Lesson.findById(quizData.lesson);
    if (!lesson) {
      throw new ApiError(404, 'Lesson not found');
    }
    
    if (lesson.course?.toString() !== (quizData as any).course) {
      throw new ApiError(400, 'Lesson does not belong to the selected course');
    }

    // Check if user is course author or admin
    if (course.author.toString() !== userId) {
      const user = await User.findById(userId);
      if (user?.role !== 'admin') {
        throw new ApiError(403, 'You can only create quizzes for your own courses');
      }
    }

    // Check if quiz already exists for this lesson
    const existingQuiz = await Quiz.findOne({ lesson: quizData.lesson });
    if (existingQuiz) {
      throw new ApiError(400, 'A quiz already exists for this lesson. Please update the existing quiz instead.');
    }

    const quiz = await Quiz.create({
      ...quizData,
      author: userId,
      course: (quizData as any).course, // Ensure course is saved
    });

    return quiz;
  }

  // Generate AI quiz (placeholder - integrate with AI later)
  async generateQuiz(userId: string, generateData: IGenerateQuizRequest) {
    const { topic, difficulty, questionCount = 5, lessonId } = generateData;

    // Fetch lesson content if lessonId provided
    let lessonContent = '';
    if (lessonId) {
      const lesson = await Lesson.findById(lessonId);
      if (lesson) {
        lessonContent = lesson.content;
      }
    }

    // TODO: Integrate with OpenAI/Claude to generate questions based on topic/lesson
    // For now, creating template questions
    const questions = Array.from({ length: questionCount }, (_, i) => ({
      type: i % 3 === 0 ? 'mcq' : i % 3 === 1 ? 'true-false' : 'fill-blank',
      question: `Question ${i + 1} about ${topic}?`,
      options: i % 3 === 0 ? ['Option A', 'Option B', 'Option C', 'Option D'] : undefined,
      correctAnswer: i % 3 === 0 ? 'Option A' : i % 3 === 1 ? 'true' : 'answer',
      explanation: `This is the explanation for question ${i + 1} about ${topic}.`,
      points: 1,
    }));

    const quiz = await Quiz.create({
      title: `${topic} Quiz`,
      description: `Test your knowledge on ${topic}`,
      topic,
      difficulty,
      questions: questions as any,
      lesson: lessonId,
      author: userId,
      isPublished: true,
    });

    return quiz;
  }

  // Get quizzes with filters
  async getQuizzes(filters: any, page: number, limit: number) {
    const query: any = { isPublished: true };

    if (filters.topic) {
      query.topic = { $regex: filters.topic, $options: 'i' };
    }

    if (filters.difficulty) {
      query.difficulty = filters.difficulty;
    }

    if (filters.lesson) {
      query.lesson = filters.lesson;
    }

    const skip = (page - 1) * limit;

    const [quizzes, total] = await Promise.all([
      Quiz.find(query)
        .populate('author', 'name profilePicture')
        .populate('lesson', 'title topic')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Quiz.countDocuments(query),
    ]);

    return {
      quizzes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get quiz by ID
  async getQuizById(quizId: string, userId?: string) {
    const quiz = await Quiz.findById(quizId)
      .populate('author', 'name profilePicture')
      .populate('lesson', 'title topic');

    if (!quiz) {
      throw new ApiError(404, 'Quiz not found');
    }

    // Check premium access
    if (quiz.isPremium && userId) {
      const user = await User.findById(userId);
      if (!user?.isPremium) {
        throw new ApiError(403, 'Premium subscription required');
      }
    }

    return quiz;
  }

  // Get quiz by lesson ID
  async getQuizByLesson(lessonId: string) {
    const quiz = await Quiz.findOne({ lesson: lessonId, isPublished: true })
      .populate('author', 'name profilePicture')
      .populate('lesson', 'title topic');

    if (!quiz) {
      throw new ApiError(404, 'No quiz found for this lesson');
    }

    return quiz;
  }

  // Get quiz attempts for a specific quiz
  async getQuizAttempts(quizId: string, userId: string) {
    const attempts = await QuizAttempt.find({ 
      quiz: quizId, 
      user: userId 
    })
      .sort({ createdAt: -1 })
      .lean();

    return attempts;
  }

  // Submit quiz attempt
  async submitQuiz(userId: string, submitData: ISubmitQuizRequest) {
    const { quizId, answers, timeTaken } = submitData;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new ApiError(404, 'Quiz not found');
    }

    // Calculate score
    let earnedPoints = 0;
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    
    const gradedAnswers = answers.map((answer) => {
      const question = quiz.questions[answer.questionIndex];
      if (!question) {
        return {
          questionIndex: answer.questionIndex,
          answer: answer.answer,
          isCorrect: false,
          points: 0,
        };
      }

      const isCorrect = this.checkAnswer(answer.answer, question.correctAnswer);
      const points = isCorrect ? question.points : 0;
      earnedPoints += points;

      return {
        questionIndex: answer.questionIndex,
        answer: answer.answer,
        isCorrect,
        points,
      };
    });

    const score = Math.round((earnedPoints / totalPoints) * 100);
    const passed = score >= quiz.passingScore;

    // Create attempt record
    const attempt = await QuizAttempt.create({
      user: userId,
      quiz: quizId,
      answers: gradedAnswers,
      score,
      totalPoints,
      earnedPoints,
      timeTaken,
      passed,
    });

    // Update quiz statistics
    const allAttempts = await QuizAttempt.find({ quiz: quizId });
    const averageScore = allAttempts.reduce((sum, a) => sum + a.score, 0) / allAttempts.length;
    
    quiz.attempts = allAttempts.length;
    quiz.averageScore = Math.round(averageScore);
    await quiz.save();

    // Award XP if passed
    if (passed) {
      await this.awardQuizXP(userId, earnedPoints);
      
      // Unlock next lesson if this quiz is linked to a lesson
      if (quiz.lesson) {
        await this.unlockNextLesson(userId, quiz.lesson.toString());
      }
    }

    return {
      attempt,
      quiz: {
        title: quiz.title,
        passingScore: quiz.passingScore,
      },
      results: {
        score,
        passed,
        earnedPoints,
        totalPoints,
        correctAnswers: gradedAnswers.filter(a => a.isCorrect).length,
        totalQuestions: quiz.questions.length,
        nextLessonUnlocked: passed && !!quiz.lesson,
      },
    };
  }

  // Get user's quiz attempts
  async getUserAttempts(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [attempts, total] = await Promise.all([
      QuizAttempt.find({ user: userId })
        .populate('quiz', 'title topic difficulty passingScore')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      QuizAttempt.countDocuments({ user: userId }),
    ]);

    return {
      attempts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get quiz attempt details
  async getAttemptDetails(attemptId: string, userId: string) {
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      user: userId,
    }).populate('quiz');

    if (!attempt) {
      throw new ApiError(404, 'Quiz attempt not found');
    }

    return attempt;
  }

  // Helper: Check if answer is correct
  private checkAnswer(userAnswer: string | string[], correctAnswer: string | string[]): boolean {
    if (Array.isArray(correctAnswer)) {
      if (!Array.isArray(userAnswer)) return false;
      return JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswer.sort());
    }
    
    if (Array.isArray(userAnswer)) return false;
    
    return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
  }

  // Helper: Award XP for quiz
  private async awardQuizXP(userId: string, points: number) {
    const user = await User.findById(userId);
    if (!user) return;

    const xpToAward = points * 10; // 10 XP per point
    user.xp += xpToAward;
    user.level = Math.floor(user.xp / 100) + 1;
    
    await user.save();
  }

  // Helper: Unlock next lesson after passing quiz
  private async unlockNextLesson(userId: string, lessonId: string) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson || !lesson.course) return;
    
    // Find enrollment
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: lesson.course,
    });

    if (!enrollment) return;

    // Add current lesson to completed if not already there
    if (!enrollment.completedLessons.some((id: any) => id.toString() === lessonId)) {
      enrollment.completedLessons.push(lessonId as any);
      
      // Update progress
      const course = await Course.findById(lesson.course);
      if (course) {
        const totalLessons = course.lessons.length;
        const completedCount = enrollment.completedLessons.length;
        enrollment.progress = Math.round((completedCount / totalLessons) * 100);
        
        // Mark course as completed if 100%
        if (enrollment.progress === 100 && !enrollment.completedAt) {
          enrollment.completedAt = new Date();
          
          // Award completion XP
          const user = await User.findById(userId);
          if (user) {
            user.xp += 200;
            user.level = Math.floor(user.xp / 100) + 1;
            await user.save();
          }
        }
      }
      
      await enrollment.save();
    }
  }
}

export default new QuizService();

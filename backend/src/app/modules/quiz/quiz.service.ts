import ApiError from '../../../utils/ApiError';
import { Quiz, QuizAttempt } from './quiz.model';
import User from '../auth/auth.model';
import Lesson from '../microLessons/lesson.model';
import {
  ICreateQuizRequest,
  IGenerateQuizRequest,
  ISubmitQuizRequest,
} from './quiz.types';

class QuizService {
  // Create quiz
  async createQuiz(userId: string, quizData: ICreateQuizRequest) {
    const quiz = await Quiz.create({
      ...quizData,
      author: userId,
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
}

export default new QuizService();

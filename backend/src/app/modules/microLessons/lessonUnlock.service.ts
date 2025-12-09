import Lesson from '../microLessons/lesson.model';
import { QuizAttempt } from '../quiz/quiz.model';
import { Enrollment } from '../course/course.model';
import ApiError from '../../../utils/ApiError';

class LessonUnlockService {
  /**
   * Check if a lesson is unlocked for a user
   * - First lesson is always unlocked
   * - Subsequent lessons require previous lesson's quiz to be passed
   */
  async isLessonUnlocked(userId: string, lessonId: string): Promise<boolean> {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new ApiError(404, 'Lesson not found');
    }

    // If lesson is not part of a course, it's always unlocked
    if (!lesson.course) {
      return true;
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: lesson.course,
    });

    if (!enrollment) {
      return false; // Not enrolled, so locked
    }

    // Get all lessons in this course ordered by order field
    const courseLessons = await Lesson.find({ course: lesson.course })
      .sort({ order: 1 })
      .lean();

    // Find current lesson index
    const currentLessonIndex = courseLessons.findIndex(
      (l) => l._id.toString() === lessonId
    );

    // First lesson is always unlocked
    if (currentLessonIndex === 0) {
      return true;
    }

    // Check if previous lesson's quiz is passed
    const previousLesson = courseLessons[currentLessonIndex - 1];
    
    // Get the quiz for the previous lesson
    const Quiz = require('../quiz/quiz.model').Quiz;
    const previousQuiz = await Quiz.findOne({ lesson: previousLesson._id }).lean();

    if (!previousQuiz) {
      // If previous lesson has no quiz, check if it's completed
      return enrollment.completedLessons.some(
        (id) => id.toString() === previousLesson._id.toString()
      );
    }

    // Check if user passed the previous lesson's quiz
    const quizAttempt = await QuizAttempt.findOne({
      user: userId,
      quiz: previousQuiz._id,
      passed: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    return !!quizAttempt;
  }

  /**
   * Get all unlocked lessons for a user in a course
   */
  async getUnlockedLessons(userId: string, courseId: string): Promise<string[]> {
    const unlockedLessonIds: string[] = [];

    const courseLessons = await Lesson.find({ course: courseId })
      .sort({ order: 1 })
      .lean();

    for (const lesson of courseLessons) {
      const isUnlocked = await this.isLessonUnlocked(userId, lesson._id.toString());
      if (isUnlocked) {
        unlockedLessonIds.push(lesson._id.toString());
      } else {
        // Once we find a locked lesson, all subsequent lessons are locked
        break;
      }
    }

    return unlockedLessonIds;
  }

  /**
   * Check if next lesson should be unlocked after quiz pass
   */
  async unlockNextLesson(_userId: string, currentLessonId: string): Promise<boolean> {
    const currentLesson = await Lesson.findById(currentLessonId);
    if (!currentLesson || !currentLesson.course) {
      return false;
    }

    // Get next lesson
    const nextLesson = await Lesson.findOne({
      course: currentLesson.course,
      order: currentLesson.order + 1,
    });

    if (!nextLesson) {
      return false; // No next lesson
    }

    // The quiz attempt handler will check if the next lesson is unlocked
    return true;
  }
}

export default new LessonUnlockService();

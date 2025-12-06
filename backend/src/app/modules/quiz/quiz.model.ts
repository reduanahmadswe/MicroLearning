import mongoose, { Schema } from 'mongoose';
import { IQuiz, IQuizAttempt } from './quiz.types';

const quizQuestionSchema = new Schema({
  type: {
    type: String,
    enum: ['mcq', 'true-false', 'fill-blank'],
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: [String],
  correctAnswer: {
    type: Schema.Types.Mixed,
    required: true,
  },
  explanation: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    default: 1,
    min: 1,
  },
});

const quizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: false, // Optional for course-level quizzes (Quiz Arena)
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Quiz must be linked to a course'],
      index: true,
    },
    topic: {
      type: String,
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
      index: true,
    },
    questions: {
      type: [quizQuestionSchema],
      required: true,
      validate: {
        validator: function(v: any[]) {
          return v && v.length > 0 && v.length <= 50;
        },
        message: 'Quiz must have between 1 and 50 questions',
      },
    },
    timeLimit: {
      type: Number,
      min: 1,
    },
    passingScore: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    quiz: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true,
    },
    answers: [
      {
        questionIndex: {
          type: Number,
          required: true,
        },
        answer: {
          type: Schema.Types.Mixed,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
        points: {
          type: Number,
          required: true,
        },
      },
    ],
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    totalPoints: {
      type: Number,
      required: true,
    },
    earnedPoints: {
      type: Number,
      required: true,
    },
    timeTaken: {
      type: Number,
      required: true,
      min: 0,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user-quiz attempts
quizAttemptSchema.index({ user: 1, quiz: 1 });

export const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema);
export const QuizAttempt = mongoose.model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);

import mongoose, { Schema } from 'mongoose';
import { ICourse, IEnrollment } from './course.types';

const courseLessonSchema = new Schema(
  {
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    isOptional: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
      index: true,
    },
    thumbnailUrl: String,
    lessons: {
      type: [courseLessonSchema],
      default: [],
    },
    estimatedDuration: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPremium: {
      type: Boolean,
      default: false,
      index: true,
    },
    price: {
      type: Number,
      min: 0,
    },
    enrolledCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create slug from title before saving
courseSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Add random string to ensure uniqueness
    this.slug = `${this.slug}-${Date.now().toString(36)}`;
  }
  next();
});

// Enrollment schema
const enrollmentSchema = new Schema<IEnrollment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedLessons: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
    lastAccessedLesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Compound unique index - user can only enroll once per course
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

// Course Payment schema
const coursePaymentSchema = new Schema<import('./course.types').ICoursePayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'BDT',
      uppercase: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['sslcommerz'],
      default: 'sslcommerz',
    },
    transactionId: {
      type: String,
      index: true,
    },
    sslSessionId: {
      type: String,
      index: true,
    },
    bankTransactionId: String,
    cardType: String,
    cardBrand: String,
    paymentCompletedAt: Date,
    refundedAt: Date,
    refundReason: String,
  },
  {
    timestamps: true,
  }
);

coursePaymentSchema.index({ user: 1, course: 1 });

export const Course = mongoose.model<ICourse>('Course', courseSchema);
export const Enrollment = mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);
export const CoursePayment = mongoose.model('CoursePayment', coursePaymentSchema);


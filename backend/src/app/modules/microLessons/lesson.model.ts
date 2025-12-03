import mongoose, { Schema } from 'mongoose';
import { ILesson } from './lesson.types';

const lessonSchema = new Schema<ILesson>(
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
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
      index: true,
    },
    estimatedTime: {
      type: Number,
      required: true,
      min: [1, 'Estimated time must be at least 1 minute'],
      max: [60, 'Estimated time cannot exceed 60 minutes'],
    },
    
    // Media
    media: [
      {
        type: {
          type: String,
          enum: ['image', 'video', 'audio', 'document'],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        title: String,
        duration: Number,
      },
    ],
    thumbnailUrl: String,
    
    // AI Generated
    aiSummary: String,
    keyPoints: {
      type: [String],
      default: [],
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    
    // Metadata
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Lesson must be linked to a course'],
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    requiredQuizScore: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
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
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    completions: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    // SEO
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    metaDescription: String,
  },
  {
    timestamps: true,
  }
);

// Create slug from title before saving
lessonSchema.pre('save', function (next) {
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

// Text index for search
lessonSchema.index({
  title: 'text',
  description: 'text',
  content: 'text',
  tags: 'text',
});

const Lesson = mongoose.model<ILesson>('Lesson', lessonSchema);

export default Lesson;

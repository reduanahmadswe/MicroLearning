import { Schema, model } from 'mongoose';
import { IVideo, IVideoProgress, IVideoAnalytics } from './video.types';

const videoQualitySchema = new Schema(
  {
    quality: { type: String, required: true },
    url: { type: String, required: true },
    fileSize: { type: Number, required: true },
    bitrate: { type: Number },
  },
  { _id: false }
);

const subtitleSchema = new Schema(
  {
    language: { type: String, required: true },
    languageCode: { type: String, required: true },
    url: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const videoSchema = new Schema<IVideo>(
  {
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      index: true,
    },
    uploader: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0,
    },
    resolution: {
      type: String,
    },
    format: {
      type: String,
      required: true,
    },
    qualities: [videoQualitySchema],
    subtitles: [subtitleSchema],
    status: {
      type: String,
      enum: ['processing', 'ready', 'failed'],
      default: 'processing',
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
videoSchema.index({ title: 'text', description: 'text' });
videoSchema.index({ lesson: 1, createdAt: -1 });
videoSchema.index({ uploader: 1, createdAt: -1 });
videoSchema.index({ tags: 1 });
videoSchema.index({ duration: 1 });
videoSchema.index({ viewCount: -1 });

const videoProgressSchema = new Schema<IVideoProgress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
      index: true,
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      index: true,
    },
    watchedDuration: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastPosition: {
      type: Number,
      default: 0,
      min: 0,
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
    },
    playbackSpeed: {
      type: Number,
      default: 1.0,
      min: 0.25,
      max: 2.0,
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
videoProgressSchema.index({ user: 1, video: 1 }, { unique: true });
videoProgressSchema.index({ user: 1, lesson: 1 });
videoProgressSchema.index({ video: 1, completed: 1 });

const dropOffPointSchema = new Schema(
  {
    timestamp: { type: Number, required: true },
    dropOffCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const videoAnalyticsSchema = new Schema<IVideoAnalytics>(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    uniqueViewers: {
      type: Number,
      default: 0,
    },
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    averageWatchTime: {
      type: Number,
      default: 0,
    },
    dropOffPoints: [dropOffPointSchema],
    qualityDistribution: [
      {
        quality: String,
        count: Number,
      },
    ],
    deviceDistribution: [
      {
        device: String,
        count: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index for daily analytics
videoAnalyticsSchema.index({ video: 1, date: -1 }, { unique: true });

export const Video = model<IVideo>('Video', videoSchema);
export const VideoProgress = model<IVideoProgress>('VideoProgress', videoProgressSchema);
export const VideoAnalytics = model<IVideoAnalytics>('VideoAnalytics', videoAnalyticsSchema);

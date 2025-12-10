import { Schema, model } from 'mongoose';
import { ITTSLibraryItem } from './tts.types';

const ttsLibrarySchema = new Schema<ITTSLibraryItem>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
    },
    audioUrl: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    voice: {
      type: String,
      enum: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
      required: true,
    },
    model: {
      type: String,
      enum: ['tts-1', 'tts-1-hd'],
      default: 'tts-1',
    },
    format: {
      type: String,
      enum: ['mp3', 'opus', 'aac', 'flac'],
      default: 'mp3',
    },
    fileSize: {
      type: Number,
      required: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      index: true,
    },
    plays: {
      type: Number,
      default: 0,
    },
    cost: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ttsLibrarySchema.index({ user: 1, createdAt: -1 });

ttsLibrarySchema.index({ voice: 1 });

export const TTSLibrary = model<ITTSLibraryItem>('TTSLibrary', ttsLibrarySchema);

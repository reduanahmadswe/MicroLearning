import { Schema, model } from 'mongoose';
import { ITranscriptionHistory } from './asr.types';

const transcriptionHistorySchema = new Schema<ITranscriptionHistory>(
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
    originalFileName: {
      type: String,
      required: true,
    },
    transcription: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      index: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    model: {
      type: String,
      enum: ['whisper-1'],
      default: 'whisper-1',
    },
    format: {
      type: String,
      enum: ['json', 'text', 'srt', 'vtt', 'verbose_json'],
      default: 'json',
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      index: true,
    },
    segments: [{
      id: Number,
      start: Number,
      end: Number,
      text: String,
      confidence: Number,
    }],
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
transcriptionHistorySchema.index({ user: 1, createdAt: -1 });
transcriptionHistorySchema.index({ lessonId: 1 });
transcriptionHistorySchema.index({ language: 1 });

export const TranscriptionHistory = model<ITranscriptionHistory>(
  'TranscriptionHistory',
  transcriptionHistorySchema
);

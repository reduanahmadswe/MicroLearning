import { Schema, model, Types } from 'mongoose';

export interface ITutorMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ITutorSession {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  messages: ITutorMessage[];
  topic?: string;
  lessonId?: Types.ObjectId;
  courseId?: Types.ObjectId;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const tutorMessageSchema = new Schema<ITutorMessage>({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const tutorSessionSchema = new Schema<ITutorSession>(
  {
    userId: {
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
    messages: [tutorMessageSchema],
    topic: {
      type: String,
      trim: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
tutorSessionSchema.index({ userId: 1, createdAt: -1 });
tutorSessionSchema.index({ userId: 1, isActive: 1 });

export const TutorSession = model<ITutorSession>('TutorSession', tutorSessionSchema);

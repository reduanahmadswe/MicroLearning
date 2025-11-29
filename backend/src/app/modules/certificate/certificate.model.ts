import mongoose, { Schema } from 'mongoose';
import { ICertificate } from './certificate.types';

const certificateSchema = new Schema<ICertificate>(
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
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    issuedDate: {
      type: Date,
      default: Date.now,
    },
    verificationCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    metadata: {
      userName: {
        type: String,
        required: true,
      },
      courseName: {
        type: String,
        required: true,
      },
      completionDate: {
        type: Date,
        required: true,
      },
      totalLessons: {
        type: Number,
        required: true,
      },
      score: Number,
      instructor: String,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index - one certificate per user per course
certificateSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model<ICertificate>('Certificate', certificateSchema);

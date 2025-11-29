import { Schema, model } from 'mongoose';
import { IFileMetadata } from './upload.types';

const fileMetadataSchema = new Schema<IFileMetadata>(
  {
    user: {
      type: String,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['image', 'video', 'audio', 'document'],
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileKey: {
      type: String,
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
fileMetadataSchema.index({ user: 1, createdAt: -1 });
fileMetadataSchema.index({ fileType: 1 });

export const FileMetadata = model<IFileMetadata>('FileMetadata', fileMetadataSchema);

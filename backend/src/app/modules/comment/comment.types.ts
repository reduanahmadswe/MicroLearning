import mongoose from 'mongoose';

export interface IComment {
  lesson: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  parentComment?: mongoose.Types.ObjectId; // For replies
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
  isEdited: boolean;
  isDeleted: boolean;
  isApproved: boolean;
  isFlagged: boolean;
  moderationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCommentRequest {
  lesson: string;
  content: string;
  parentComment?: string;
}

export interface IUpdateCommentRequest {
  content: string;
}

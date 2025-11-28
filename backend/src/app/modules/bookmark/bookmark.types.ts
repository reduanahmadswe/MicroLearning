import mongoose from 'mongoose';

export interface IBookmark {
  user: mongoose.Types.ObjectId;
  lesson: mongoose.Types.ObjectId;
  collection?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddBookmarkRequest {
  lessonId: string;
  collection?: string;
  notes?: string;
}

export interface IUpdateBookmarkRequest {
  collection?: string;
  notes?: string;
}

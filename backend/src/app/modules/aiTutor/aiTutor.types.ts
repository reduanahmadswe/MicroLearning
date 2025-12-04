import { Types } from 'mongoose';

export interface IChatRequest {
  message: string;
  sessionId?: string;
  topic?: string;
  lessonId?: string;
  courseId?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface IChatResponse {
  sessionId: string;
  response: string;
  title?: string;
}

export interface ISessionListItem {
  _id: Types.ObjectId;
  title: string;
  topic?: string;
  lastMessage: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

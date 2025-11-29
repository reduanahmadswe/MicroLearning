import { Types } from 'mongoose';

export interface IVideo {
  _id: Types.ObjectId;
  lesson: Types.ObjectId;
  uploader: Types.ObjectId;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number; // in seconds
  fileSize: number; // in bytes
  resolution?: string; // e.g., "1920x1080"
  format: string; // e.g., "mp4", "webm"
  qualities?: IVideoQuality[];
  subtitles?: ISubtitle[];
  status: 'processing' | 'ready' | 'failed';
  viewCount: number;
  isPublic: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IVideoQuality {
  quality: string; // e.g., "360p", "480p", "720p", "1080p"
  url: string;
  fileSize: number;
  bitrate?: number;
}

export interface ISubtitle {
  language: string;
  languageCode: string; // e.g., "en", "es", "fr"
  url: string;
  isDefault?: boolean;
}

export interface IVideoProgress {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  video: Types.ObjectId;
  lesson: Types.ObjectId;
  watchedDuration: number; // in seconds
  lastPosition: number; // last playback position in seconds
  completed: boolean;
  completedAt?: Date;
  playbackSpeed?: number;
  lastWatchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVideoAnalytics {
  _id: Types.ObjectId;
  video: Types.ObjectId;
  date: Date;
  views: number;
  uniqueViewers: number;
  completionRate: number; // percentage
  averageWatchTime: number; // in seconds
  dropOffPoints: IDropOffPoint[];
  qualityDistribution: {
    quality: string;
    count: number;
  }[];
  deviceDistribution: {
    device: string;
    count: number;
  }[];
}

export interface IDropOffPoint {
  timestamp: number; // in seconds
  dropOffCount: number;
}

export interface ICreateVideoRequest {
  lessonId: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  fileSize: number;
  resolution?: string;
  format: string;
  isPublic?: boolean;
  tags?: string[];
}

export interface IUpdateVideoRequest {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  isPublic?: boolean;
  tags?: string[];
}

export interface IAddSubtitleRequest {
  language: string;
  languageCode: string;
  url: string;
  isDefault?: boolean;
}

export interface IUpdateProgressRequest {
  watchedDuration: number;
  lastPosition: number;
  completed?: boolean;
  playbackSpeed?: number;
}

export interface IVideoSearchQuery {
  query?: string;
  lessonId?: string;
  uploaderId?: string;
  tags?: string[];
  minDuration?: number;
  maxDuration?: number;
  status?: 'processing' | 'ready' | 'failed';
  isPublic?: boolean;
  sortBy?: 'recent' | 'popular' | 'duration';
  page?: number;
  limit?: number;
}

export interface IVideoStats {
  totalVideos: number;
  totalDuration: number; // in seconds
  totalViews: number;
  averageCompletionRate: number;
  popularVideos: {
    video: IVideo;
    views: number;
  }[];
  recentUploads: IVideo[];
}

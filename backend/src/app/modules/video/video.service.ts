import { Video, VideoProgress, VideoAnalytics } from './video.model';
import {
  ICreateVideoRequest,
  IUpdateVideoRequest,
  IAddSubtitleRequest,
  IUpdateProgressRequest,
  IVideoSearchQuery,
  IVideoStats,
  IVideoQuality,
} from './video.types';
import ApiError from '../../../utils/ApiError';
import httpStatus from 'http-status';

/**
 * ========================================
 * VIDEO SERVICES
 * ========================================
 */

/**
 * Create Video
 */
export const createVideo = async (uploaderId: string, data: ICreateVideoRequest) => {
  const video = await Video.create({
    ...data,
    uploader: uploaderId,
    lesson: data.lessonId,
    status: 'processing',
    viewCount: 0,
  });

  return video.populate('uploader', 'name email avatar');
};

/**
 * Get Videos with Filters
 */
export const getVideos = async (filters: IVideoSearchQuery) => {
  const {
    query,
    lessonId,
    uploaderId,
    tags,
    minDuration,
    maxDuration,
    status,
    isPublic,
    sortBy = 'recent',
    page = 1,
    limit = 20,
  } = filters;

  const filter: any = {};

  // Text search
  if (query) {
    filter.$text = { $search: query };
  }

  // Filters
  if (lessonId) filter.lesson = lessonId;
  if (uploaderId) filter.uploader = uploaderId;
  if (status) filter.status = status;
  if (isPublic !== undefined) filter.isPublic = isPublic;
  if (tags && tags.length > 0) filter.tags = { $in: tags };

  // Duration range
  if (minDuration !== undefined || maxDuration !== undefined) {
    filter.duration = {};
    if (minDuration !== undefined) filter.duration.$gte = minDuration;
    if (maxDuration !== undefined) filter.duration.$lte = maxDuration;
  }

  // Sorting
  let sort: any = {};
  switch (sortBy) {
    case 'popular':
      sort = { viewCount: -1 };
      break;
    case 'duration':
      sort = { duration: -1 };
      break;
    case 'recent':
    default:
      sort = { createdAt: -1 };
  }

  const skip = (page - 1) * limit;

  const [videos, total] = await Promise.all([
    Video.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('uploader', 'name email avatar')
      .populate('lesson', 'title subject')
      .lean(),
    Video.countDocuments(filter),
  ]);

  return {
    videos,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

/**
 * Get Video Details
 */
export const getVideoDetails = async (videoId: string, userId?: string) => {
  const video = await Video.findById(videoId)
    .populate('uploader', 'name email avatar')
    .populate('lesson', 'title subject description');

  if (!video) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Video not found');
  }

  // Check if video is private and user has access
  if (!video.isPublic && (!userId || video.uploader.toString() !== userId)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied to private video');
  }

  let progress = null;
  if (userId) {
    progress = await VideoProgress.findOne({
      user: userId,
      video: videoId,
    });
  }

  return {
    video,
    progress,
  };
};

/**
 * Update Video
 */
export const updateVideo = async (videoId: string, userId: string, data: IUpdateVideoRequest) => {
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Video not found');
  }

  if (video.uploader.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only uploader can update video');
  }

  Object.assign(video, data);
  await video.save();

  return video.populate('uploader', 'name email avatar');
};

/**
 * Delete Video
 */
export const deleteVideo = async (videoId: string, userId: string) => {
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Video not found');
  }

  if (video.uploader.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only uploader can delete video');
  }

  // Delete associated data
  await Promise.all([
    Video.findByIdAndDelete(videoId),
    VideoProgress.deleteMany({ video: videoId }),
    VideoAnalytics.deleteMany({ video: videoId }),
  ]);

  return { message: 'Video deleted successfully' };
};

/**
 * Update Video Status
 */
export const updateVideoStatus = async (
  videoId: string,
  userId: string,
  status: 'processing' | 'ready' | 'failed'
) => {
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Video not found');
  }

  if (video.uploader.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only uploader can update status');
  }

  video.status = status;
  await video.save();

  return video;
};

/**
 * Add Video Quality
 */
export const addVideoQuality = async (videoId: string, userId: string, quality: IVideoQuality) => {
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Video not found');
  }

  if (video.uploader.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only uploader can add quality');
  }

  // Check if quality already exists
  const existingQuality = video.qualities?.find((q) => q.quality === quality.quality);
  if (existingQuality) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This quality already exists');
  }

  if (!video.qualities) {
    video.qualities = [];
  }

  video.qualities.push(quality);
  await video.save();

  return video;
};

/**
 * Add Subtitle
 */
export const addSubtitle = async (videoId: string, userId: string, subtitle: IAddSubtitleRequest) => {
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Video not found');
  }

  if (video.uploader.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only uploader can add subtitles');
  }

  // Check if subtitle for this language already exists
  const existingSubtitle = video.subtitles?.find((s) => s.languageCode === subtitle.languageCode);
  if (existingSubtitle) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Subtitle for this language already exists');
  }

  if (!video.subtitles) {
    video.subtitles = [];
  }

  // If this is set as default, unset other defaults
  if (subtitle.isDefault) {
    video.subtitles.forEach((s) => (s.isDefault = false));
  }

  video.subtitles.push(subtitle);
  await video.save();

  return video;
};

/**
 * Remove Subtitle
 */
export const removeSubtitle = async (videoId: string, userId: string, languageCode: string) => {
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Video not found');
  }

  if (video.uploader.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only uploader can remove subtitles');
  }

  if (!video.subtitles || video.subtitles.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No subtitles to remove');
  }

  video.subtitles = video.subtitles.filter((s) => s.languageCode !== languageCode);
  await video.save();

  return { message: 'Subtitle removed successfully' };
};

/**
 * Increment View Count
 */
export const incrementViewCount = async (videoId: string) => {
  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { viewCount: 1 } },
    { new: true }
  );

  if (!video) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Video not found');
  }

  return video;
};

/**
 * ========================================
 * VIDEO PROGRESS SERVICES
 * ========================================
 */

/**
 * Update Video Progress
 */
export const updateProgress = async (
  videoId: string,
  userId: string,
  data: IUpdateProgressRequest
) => {
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Video not found');
  }

  // Check if progress exists
  let progress = await VideoProgress.findOne({
    user: userId,
    video: videoId,
  });

  if (progress) {
    // Update existing progress
    progress.watchedDuration = Math.max(progress.watchedDuration, data.watchedDuration);
    progress.lastPosition = data.lastPosition;
    progress.lastWatchedAt = new Date();

    if (data.playbackSpeed !== undefined) {
      progress.playbackSpeed = data.playbackSpeed;
    }

    // Check completion (80% watched = completed)
    if (data.completed || (data.watchedDuration / video.duration) >= 0.8) {
      if (!progress.completed) {
        progress.completed = true;
        progress.completedAt = new Date();
      }
    }

    await progress.save();
  } else {
    // Create new progress
    const completed = data.completed || (data.watchedDuration / video.duration) >= 0.8;

    progress = await VideoProgress.create({
      user: userId,
      video: videoId,
      lesson: video.lesson,
      watchedDuration: data.watchedDuration,
      lastPosition: data.lastPosition,
      completed,
      completedAt: completed ? new Date() : undefined,
      playbackSpeed: data.playbackSpeed || 1.0,
      lastWatchedAt: new Date(),
    });
  }

  return progress;
};

/**
 * Get User Progress for Video
 */
export const getUserProgress = async (videoId: string, userId: string) => {
  const progress = await VideoProgress.findOne({
    user: userId,
    video: videoId,
  }).populate('video', 'title duration thumbnailUrl');

  return progress;
};

/**
 * Get User Progress for Lesson
 */
export const getUserProgressByLesson = async (lessonId: string, userId: string) => {
  const progress = await VideoProgress.find({
    user: userId,
    lesson: lessonId,
  }).populate('video', 'title duration thumbnailUrl');

  return progress;
};

/**
 * Get All User Progress
 */
export const getAllUserProgress = async (userId: string, page = 1, limit = 50) => {
  const skip = (page - 1) * limit;

  const [progress, total] = await Promise.all([
    VideoProgress.find({ user: userId })
      .sort({ lastWatchedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('video', 'title duration thumbnailUrl')
      .populate('lesson', 'title subject'),
    VideoProgress.countDocuments({ user: userId }),
  ]);

  return {
    progress,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

/**
 * ========================================
 * VIDEO ANALYTICS SERVICES
 * ========================================
 */

/**
 * Get Video Analytics
 */
export const getVideoAnalytics = async (videoId: string, userId: string, days = 30) => {
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Video not found');
  }

  if (video.uploader.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only uploader can view analytics');
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const analytics = await VideoAnalytics.find({
    video: videoId,
    date: { $gte: startDate },
  }).sort({ date: 1 });

  const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
  const totalUniqueViewers = analytics.reduce((sum, a) => sum + a.uniqueViewers, 0);
  const averageCompletionRate =
    analytics.length > 0
      ? analytics.reduce((sum, a) => sum + a.completionRate, 0) / analytics.length
      : 0;

  return {
    video,
    analytics,
    summary: {
      totalViews,
      totalUniqueViewers,
      averageCompletionRate: Math.round(averageCompletionRate * 100) / 100,
      period: `Last ${days} days`,
    },
  };
};

/**
 * Get Video Statistics
 */
export const getVideoStats = async (userId: string) => {
  const videos = await Video.find({ uploader: userId });
  const videoIds = videos.map((v) => v._id);

  const [totalVideos, progressData] = await Promise.all([
    Video.countDocuments({ uploader: userId }),
    VideoProgress.aggregate([
      { $match: { video: { $in: videoIds } } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: 1 },
          completedViews: {
            $sum: { $cond: ['$completed', 1, 0] },
          },
        },
      },
    ]),
  ]);

  const totalDuration = videos.reduce((sum, v) => sum + v.duration, 0);
  const totalViews = progressData[0]?.totalViews || 0;
  const completedViews = progressData[0]?.completedViews || 0;
  const averageCompletionRate = totalViews > 0 ? (completedViews / totalViews) * 100 : 0;

  const popularVideos = await Video.find({ uploader: userId })
    .sort({ viewCount: -1 })
    .limit(10)
    .select('title viewCount duration thumbnailUrl');

  const recentUploads = await Video.find({ uploader: userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('title status duration createdAt');

  const stats: IVideoStats = {
    totalVideos,
    totalDuration,
    totalViews,
    averageCompletionRate: Math.round(averageCompletionRate * 100) / 100,
    popularVideos: popularVideos.map((v) => ({
      video: v as any,
      views: v.viewCount,
    })),
    recentUploads: recentUploads as any,
  };

  return stats;
};

export default {
  createVideo,
  getVideos,
  getVideoDetails,
  updateVideo,
  deleteVideo,
  updateVideoStatus,
  addVideoQuality,
  addSubtitle,
  removeSubtitle,
  incrementViewCount,
  updateProgress,
  getUserProgress,
  getUserProgressByLesson,
  getAllUserProgress,
  getVideoAnalytics,
  getVideoStats,
};

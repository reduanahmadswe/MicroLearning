import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import globalErrorHandler from '../middleware/globalErrorHandler';
import authRoutes from '../app/modules/auth/auth.route';
import lessonRoutes from '../app/modules/microLessons/lesson.route';
import progressRoutes from '../app/modules/progressTracking/progress.route';
import quizRoutes from '../app/modules/quiz/quiz.route';
import flashcardRoutes from '../app/modules/flashcard/flashcard.route';
import bookmarkRoutes from '../app/modules/bookmark/bookmark.route';
import badgeRoutes from '../app/modules/badge/badge.route';
import leaderboardRoutes from '../app/modules/leaderboard/leaderboard.route';
import profileRoutes from '../app/modules/profile/profile.route';
import notificationRoutes from '../app/modules/notification/notification.route';
import commentRoutes from '../app/modules/comment/comment.route';
import courseRoutes from '../app/modules/course/course.route';
import certificateRoutes from '../app/modules/certificate/certificate.route';
import adminRoutes from '../app/modules/admin/admin.route';
import analyticsRoutes from '../app/modules/analytics/analytics.route';
import { FriendRoutes } from '../app/modules/friend/friend.route';
import { ChallengeRoutes } from '../app/modules/challenge/challenge.route';
import { UploadRoutes } from '../app/modules/upload/upload.route';
import { PushRoutes } from '../app/modules/push/push.route';
import AIRoutes from '../app/modules/ai/ai.route';
import ForumRoutes from '../app/modules/forum/forum.route';
import VideoRoutes from '../app/modules/video/video.route';
import ProgressShareRoutes from '../app/modules/progress/progress.route';
import DailyChallengeRoutes from '../app/modules/dailyChallenge/dailyChallenge.route';
import EmailRoutes from '../app/modules/email/email.route';
import TTSRoutes from '../app/modules/tts/tts.route';
import ASRRoutes from '../app/modules/asr/asr.route';
import RoadmapRoutes from '../app/modules/roadmap/roadmap.route';
import CareerMentorRoutes from '../app/modules/careerMentor/careerMentor.route';
import AITutorRoutes from '../app/modules/aiTutor/aiTutor.route';
import PostRoutes from '../app/modules/post/post.route';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/quiz', quizRoutes);
app.use('/api/v1/flashcards', flashcardRoutes);
app.use('/api/v1/bookmarks', bookmarkRoutes);
app.use('/api/v1/badges', badgeRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/certificates', certificateRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/friends', FriendRoutes);
app.use('/api/v1/challenges', ChallengeRoutes);
app.use('/api/v1/upload', UploadRoutes);
app.use('/api/v1/push', PushRoutes);
app.use('/api/v1/ai', AIRoutes);
app.use('/api/v1/forum', ForumRoutes);
app.use('/api/v1/videos', VideoRoutes);
app.use('/api/v1/progress-share', ProgressShareRoutes);
app.use('/api/v1/daily-challenges', DailyChallengeRoutes);
app.use('/api/v1/email', EmailRoutes);
app.use('/api/v1/tts', TTSRoutes);
app.use('/api/v1/asr', ASRRoutes);
app.use('/api/v1/roadmap', RoadmapRoutes);
app.use('/api/v1/career-mentor', CareerMentorRoutes);
app.use('/api/v1/ai-tutor', AITutorRoutes);
app.use('/api/v1/posts', PostRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'AI-Powered Micro-Learning Platform API',
    version: '1.0.0',
  });
});

// Handle 404 errors
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use(globalErrorHandler);

export default app;

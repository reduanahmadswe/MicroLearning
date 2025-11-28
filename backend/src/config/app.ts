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
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/flashcards', flashcardRoutes);
app.use('/api/v1/bookmarks', bookmarkRoutes);

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

import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './config/app';
import connectDatabase from './config/database';

// Load environment variables with explicit path
dotenv.config({ path: path.join(process.cwd(), '.env') });

console.log('🔑 Environment loaded:', {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  openaiKeyExists: !!process.env.OPENAI_API_KEY,
  openaiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
});

// Import queue configuration BEFORE workers
import './config/queue';
import './workers/payment.worker'; // Start payment queue workers

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Setup Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Join user's personal room for notifications
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`✅ User ${userId} joined their notification room`);
  });

  socket.on('disconnect', () => {
    console.log('👋 User disconnected:', socket.id);
  });
});

// Make io accessible globally
export { io };

// Connect to database
connectDatabase();

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`🔌 Socket.IO is ready for real-time notifications`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error: Error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

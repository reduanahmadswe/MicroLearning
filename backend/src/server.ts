import dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST before any other imports
dotenv.config({ path: path.join(process.cwd(), '.env') });

import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './config/app';
import connectDatabase from './config/database';

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

  // Join user's personal room for notifications
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on('disconnect', () => {
  });
});

// Make io accessible globally
export { io };

// Connect to database
connectDatabase();

// Start server
httpServer.listen(PORT, () => {
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

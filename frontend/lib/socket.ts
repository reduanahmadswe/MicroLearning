import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (userId: string) => {
  // Disable Socket.io on production (Vercel doesn't support WebSockets)
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    console.log('Socket.io disabled on production');
    return null;
  }

  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 5000,
    });

    socket.on('connect', () => {
      console.log('✅ Connected to notification server');
      // Join user's notification room
      socket?.emit('join', userId);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from notification server');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

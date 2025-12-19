import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';

let io = null;

// Store connected users
const connectedUsers = new Map();

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Track connected user
    connectedUsers.set(socket.userId, socket.id);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Handle subscription to feeds
    socket.on('subscribe:feed', (data) => {
      const { feedType, feedUri } = data;
      const room = feedUri || `feed:${feedType}`;
      socket.join(room);
      console.log(`User ${socket.userId} subscribed to ${room}`);
    });

    socket.on('unsubscribe:feed', (data) => {
      const { feedType, feedUri } = data;
      const room = feedUri || `feed:${feedType}`;
      socket.leave(room);
      console.log(`User ${socket.userId} unsubscribed from ${room}`);
    });

    // Handle subscription to profile updates
    socket.on('subscribe:profile', (data) => {
      const { did } = data;
      socket.join(`profile:${did}`);
    });

    socket.on('unsubscribe:profile', (data) => {
      const { did } = data;
      socket.leave(`profile:${did}`);
    });

    // Handle typing indicators for DMs
    socket.on('typing:start', (data) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit('typing', {
        userId: socket.userId,
        isTyping: true,
      });
    });

    socket.on('typing:stop', (data) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit('typing', {
        userId: socket.userId,
        isTyping: false,
      });
    });

    // Handle read receipts
    socket.on('message:read', (data) => {
      const { conversationId, messageId } = data;
      socket.to(`conversation:${conversationId}`).emit('message:read', {
        userId: socket.userId,
        messageId,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      connectedUsers.delete(socket.userId);
    });
  });

  return io;
};

export const getIO = () => io;

// Emit to specific user
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

// Emit to feed subscribers
export const emitToFeed = (feedType, event, data) => {
  if (io) {
    io.to(`feed:${feedType}`).emit(event, data);
  }
};

// Emit new post notification
export const emitNewPost = (feedType, post) => {
  emitToFeed(feedType, 'post:new', post);
};

// Emit notification
export const emitNotification = (userId, notification) => {
  emitToUser(userId, 'notification:new', notification);
};

// Emit new message
export const emitNewMessage = (userId, message) => {
  emitToUser(userId, 'message:new', message);
};

// Check if user is online
export const isUserOnline = (userId) => {
  return connectedUsers.has(userId);
};

// Get online user count
export const getOnlineUserCount = () => {
  return connectedUsers.size;
};

export { connectedUsers };

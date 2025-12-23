import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.authErrorCallback = null;
  }

  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    // Disconnect any existing socket first
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io({
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);

      // Stop reconnecting on authentication errors
      if (error.message === 'Authentication required' ||
          error.message === 'Invalid token' ||
          error.message === 'Session expired or invalid') {
        console.log('Authentication error - stopping reconnection attempts');
        this.socket.disconnect();
        this.socket = null;

        // Notify auth store to clear invalid token
        if (this.authErrorCallback) {
          this.authErrorCallback();
        }
      }
    });

    // Re-register all listeners
    this.listeners.forEach((callback, event) => {
      this.socket.on(event, callback);
    });
  }

  // Set callback for auth errors (to clear invalid tokens)
  onAuthError(callback) {
    this.authErrorCallback = callback;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribe(event, callback) {
    this.listeners.set(event, callback);
    if (this.socket) {
      this.socket.on(event, callback);
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(event);
      if (this.socket) {
        this.socket.off(event, callback);
      }
    };
  }

  // Subscribe to a feed
  subscribeToFeed(feedType, feedUri) {
    if (this.socket) {
      this.socket.emit('subscribe:feed', { feedType, feedUri });
    }
  }

  unsubscribeFromFeed(feedType, feedUri) {
    if (this.socket) {
      this.socket.emit('unsubscribe:feed', { feedType, feedUri });
    }
  }

  // Subscribe to a profile
  subscribeToProfile(did) {
    if (this.socket) {
      this.socket.emit('subscribe:profile', { did });
    }
  }

  unsubscribeFromProfile(did) {
    if (this.socket) {
      this.socket.emit('unsubscribe:profile', { did });
    }
  }

  // Typing indicators
  startTyping(conversationId) {
    if (this.socket) {
      this.socket.emit('typing:start', { conversationId });
    }
  }

  stopTyping(conversationId) {
    if (this.socket) {
      this.socket.emit('typing:stop', { conversationId });
    }
  }

  // Read receipts
  markMessageRead(conversationId, messageId) {
    if (this.socket) {
      this.socket.emit('message:read', { conversationId, messageId });
    }
  }

  // Check if connected
  isConnected() {
    return this.socket?.connected || false;
  }
}

export const wsService = new WebSocketService();
export default wsService;

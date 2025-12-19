import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useFeedStore } from '../stores/feedStore';
import wsService from '../services/websocket';

export function useWebSocket() {
  const { token } = useAuthStore();
  const { addNotification, fetchUnreadCount } = useNotificationStore();
  const { addToFeed } = useFeedStore();

  useEffect(() => {
    if (token) {
      wsService.connect(token);

      // Listen for new notifications
      const unsubNotification = wsService.subscribe('notification:new', (notification) => {
        addNotification(notification);
      });

      // Listen for new posts
      const unsubPost = wsService.subscribe('post:new', (data) => {
        const { feedType, post } = data;
        // This would need to be mapped to the correct column
        // For now, just log it
        console.log('New post in feed:', feedType, post);
      });

      // Listen for new messages
      const unsubMessage = wsService.subscribe('message:new', (message) => {
        console.log('New message:', message);
        // Handle new message
      });

      return () => {
        unsubNotification();
        unsubPost();
        unsubMessage();
        wsService.disconnect();
      };
    }
  }, [token, addNotification]);

  const subscribeToFeed = useCallback((feedType, feedUri) => {
    wsService.subscribeToFeed(feedType, feedUri);
  }, []);

  const unsubscribeFromFeed = useCallback((feedType, feedUri) => {
    wsService.unsubscribeFromFeed(feedType, feedUri);
  }, []);

  const subscribeToProfile = useCallback((did) => {
    wsService.subscribeToProfile(did);
  }, []);

  const unsubscribeFromProfile = useCallback((did) => {
    wsService.unsubscribeFromProfile(did);
  }, []);

  return {
    isConnected: wsService.isConnected(),
    subscribeToFeed,
    unsubscribeFromFeed,
    subscribeToProfile,
    unsubscribeFromProfile,
  };
}

export default useWebSocket;

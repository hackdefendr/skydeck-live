import { create } from 'zustand';
import api from '../services/api';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  cursor: null,
  isLoading: false,
  error: null,
  seenAt: null,

  fetchNotifications: async (append = false) => {
    const { cursor: existingCursor } = get();

    set({ isLoading: true, error: null });

    try {
      const params = append && existingCursor ? { cursor: existingCursor } : {};
      const response = await api.get('/notifications', { params });

      const { notifications: newNotifications, cursor, seenAt } = response.data;

      set((state) => ({
        notifications: append
          ? [...state.notifications, ...newNotifications]
          : newNotifications,
        cursor,
        seenAt,
        isLoading: false,
      }));

      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread');
      set({ unreadCount: response.data.count });
    } catch (error) {
      console.error('Fetch unread count error:', error);
    }
  },

  markAllAsSeen: async () => {
    try {
      await api.post('/notifications/seen');
      set({ unreadCount: 0, seenAt: new Date().toISOString() });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  refresh: async () => {
    return get().fetchNotifications(false);
  },

  loadMore: async () => {
    return get().fetchNotifications(true);
  },

  hasMore: () => {
    return !!get().cursor;
  },

  clearNotifications: () => {
    set({ notifications: [], cursor: null, unreadCount: 0 });
  },
}));

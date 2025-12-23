import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultPrefs = {
  // Which notification types to show
  showLikes: true,
  showReposts: true,
  showFollows: true,
  showMentions: true,
  showReplies: true,
  showQuotes: true,

  // Desktop notifications
  desktopNotifications: false,
  desktopForMentions: true,
  desktopForReplies: true,
  desktopForFollows: false,
  desktopForLikes: false,
  desktopForReposts: false,
  desktopForQuotes: true,

  // Sound settings
  soundEnabled: false,
  soundVolume: 50,

  // Display settings
  groupSimilar: true,
  showAvatars: true,
  compactMode: false,

  // Auto-refresh
  autoRefresh: true,
  refreshInterval: 30, // seconds
};

export const useNotificationPrefsStore = create(
  persist(
    (set, get) => ({
      prefs: defaultPrefs,

      updatePref: (key, value) => {
        set((state) => ({
          prefs: { ...state.prefs, [key]: value },
        }));
      },

      updatePrefs: (updates) => {
        set((state) => ({
          prefs: { ...state.prefs, ...updates },
        }));
      },

      resetPrefs: () => {
        set({ prefs: defaultPrefs });
      },

      // Check if a notification should be shown based on its type
      shouldShowNotification: (reason) => {
        const { prefs } = get();
        switch (reason) {
          case 'like':
            return prefs.showLikes;
          case 'repost':
            return prefs.showReposts;
          case 'follow':
            return prefs.showFollows;
          case 'mention':
            return prefs.showMentions;
          case 'reply':
            return prefs.showReplies;
          case 'quote':
            return prefs.showQuotes;
          default:
            return true;
        }
      },

      // Check if desktop notification should be sent for a type
      shouldSendDesktopNotification: (reason) => {
        const { prefs } = get();
        if (!prefs.desktopNotifications) return false;

        switch (reason) {
          case 'like':
            return prefs.desktopForLikes;
          case 'repost':
            return prefs.desktopForReposts;
          case 'follow':
            return prefs.desktopForFollows;
          case 'mention':
            return prefs.desktopForMentions;
          case 'reply':
            return prefs.desktopForReplies;
          case 'quote':
            return prefs.desktopForQuotes;
          default:
            return false;
        }
      },

      // Request desktop notification permission
      requestNotificationPermission: async () => {
        if (!('Notification' in window)) {
          return { granted: false, error: 'Browser does not support notifications' };
        }

        if (Notification.permission === 'granted') {
          return { granted: true };
        }

        if (Notification.permission === 'denied') {
          return { granted: false, error: 'Notifications are blocked' };
        }

        const permission = await Notification.requestPermission();
        return { granted: permission === 'granted' };
      },

      // Get notification permission status
      getNotificationPermission: () => {
        if (!('Notification' in window)) return 'unsupported';
        return Notification.permission;
      },
    }),
    {
      name: 'skydeck-notification-prefs',
    }
  )
);

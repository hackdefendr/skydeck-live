import { create } from 'zustand';
import api from '../services/api';

export const useFeedStore = create((set, get) => ({
  feeds: {}, // Keyed by column ID
  cursors: {}, // Pagination cursors
  loading: {}, // Loading states
  errors: {}, // Error states

  fetchFeed: async (columnId, append = false) => {
    const { cursors, feeds } = get();

    set((state) => ({
      loading: { ...state.loading, [columnId]: true },
      errors: { ...state.errors, [columnId]: null },
    }));

    try {
      const cursor = append ? cursors[columnId] : undefined;
      const response = await api.get(`/columns/${columnId}/feed`, {
        params: { cursor },
      });

      const newFeed = response.data.feed || response.data.notifications || response.data.posts || [];
      const newCursor = response.data.cursor;

      set((state) => ({
        feeds: {
          ...state.feeds,
          [columnId]: append ? [...(feeds[columnId] || []), ...newFeed] : newFeed,
        },
        cursors: { ...state.cursors, [columnId]: newCursor },
        loading: { ...state.loading, [columnId]: false },
      }));

      return { success: true };
    } catch (error) {
      set((state) => ({
        errors: { ...state.errors, [columnId]: error.message },
        loading: { ...state.loading, [columnId]: false },
      }));
      return { success: false, error: error.message };
    }
  },

  refreshFeed: async (columnId) => {
    return get().fetchFeed(columnId, false);
  },

  loadMore: async (columnId) => {
    return get().fetchFeed(columnId, true);
  },

  addToFeed: (columnId, items, prepend = true) => {
    set((state) => ({
      feeds: {
        ...state.feeds,
        [columnId]: prepend
          ? [...items, ...(state.feeds[columnId] || [])]
          : [...(state.feeds[columnId] || []), ...items],
      },
    }));
  },

  removeFromFeed: (columnId, itemUri) => {
    set((state) => ({
      feeds: {
        ...state.feeds,
        [columnId]: (state.feeds[columnId] || []).filter(
          (item) => item.post?.uri !== itemUri && item.uri !== itemUri
        ),
      },
    }));
  },

  updateInFeed: (columnId, itemUri, updates) => {
    set((state) => ({
      feeds: {
        ...state.feeds,
        [columnId]: (state.feeds[columnId] || []).map((item) => {
          if (item.post?.uri === itemUri) {
            return { ...item, post: { ...item.post, ...updates } };
          }
          if (item.uri === itemUri) {
            return { ...item, ...updates };
          }
          return item;
        }),
      },
    }));
  },

  clearFeed: (columnId) => {
    set((state) => {
      const { [columnId]: _, ...remainingFeeds } = state.feeds;
      const { [columnId]: __, ...remainingCursors } = state.cursors;
      return { feeds: remainingFeeds, cursors: remainingCursors };
    });
  },

  clearAllFeeds: () => {
    set({ feeds: {}, cursors: {}, loading: {}, errors: {} });
  },

  getFeed: (columnId) => {
    return get().feeds[columnId] || [];
  },

  isLoading: (columnId) => {
    return get().loading[columnId] || false;
  },

  hasMore: (columnId) => {
    return !!get().cursors[columnId];
  },
}));

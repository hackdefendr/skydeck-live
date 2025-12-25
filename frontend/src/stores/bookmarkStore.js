import { create } from 'zustand';
import api from '../services/api';

export const useBookmarkStore = create((set, get) => ({
  bookmarks: [],
  bookmarkedUris: new Set(),
  isLoading: false,
  error: null,
  cursor: null,
  hasMore: true,

  // Check if a post is bookmarked
  isBookmarked: (postUri) => {
    return get().bookmarkedUris.has(postUri);
  },

  // Fetch bookmarks
  fetchBookmarks: async (refresh = false) => {
    const state = get();
    if (state.isLoading) return;
    if (!refresh && !state.hasMore) return;

    set({ isLoading: true, error: null });

    try {
      const params = {};
      if (!refresh && state.cursor) {
        params.cursor = state.cursor;
      }

      const response = await api.get('/bookmarks', { params });
      const { feed, cursor } = response.data;

      const newBookmarks = refresh ? feed : [...state.bookmarks, ...feed];
      const newUris = new Set(newBookmarks.map(b => b.post?.uri).filter(Boolean));

      set({
        bookmarks: newBookmarks,
        bookmarkedUris: newUris,
        cursor,
        hasMore: !!cursor,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Add bookmark
  addBookmark: async (post) => {
    if (!post?.uri || !post?.cid) return { success: false };

    // Optimistically update
    const state = get();
    const newUris = new Set(state.bookmarkedUris);
    newUris.add(post.uri);
    set({ bookmarkedUris: newUris });

    try {
      await api.post('/bookmarks', {
        postUri: post.uri,
        postCid: post.cid,
        postData: post,
      });

      // Refresh bookmarks to get the new one
      get().fetchBookmarks(true);
      return { success: true };
    } catch (error) {
      // Revert on error
      newUris.delete(post.uri);
      set({ bookmarkedUris: newUris });
      console.error('Failed to add bookmark:', error);
      return { success: false, error: error.message };
    }
  },

  // Remove bookmark
  removeBookmark: async (postUri) => {
    if (!postUri) return { success: false };

    // Optimistically update
    const state = get();
    const newUris = new Set(state.bookmarkedUris);
    newUris.delete(postUri);
    const newBookmarks = state.bookmarks.filter(b => b.post?.uri !== postUri);
    set({ bookmarkedUris: newUris, bookmarks: newBookmarks });

    try {
      await api.delete(`/bookmarks/post/${encodeURIComponent(postUri)}`);
      return { success: true };
    } catch (error) {
      // Revert on error
      newUris.add(postUri);
      set({ bookmarkedUris: newUris });
      get().fetchBookmarks(true);
      console.error('Failed to remove bookmark:', error);
      return { success: false, error: error.message };
    }
  },

  // Toggle bookmark
  toggleBookmark: async (post) => {
    const isCurrentlyBookmarked = get().isBookmarked(post.uri);
    if (isCurrentlyBookmarked) {
      return get().removeBookmark(post.uri);
    } else {
      return get().addBookmark(post);
    }
  },

  // Get bookmark count
  getCount: async () => {
    try {
      const response = await api.get('/bookmarks/count');
      return response.data.count;
    } catch (error) {
      console.error('Failed to get bookmark count:', error);
      return 0;
    }
  },

  // Clear all bookmarks (local state)
  clear: () => {
    set({
      bookmarks: [],
      bookmarkedUris: new Set(),
      cursor: null,
      hasMore: true,
      error: null,
    });
  },
}));

export default useBookmarkStore;

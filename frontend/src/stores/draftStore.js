import { create } from 'zustand';
import api from '../services/api';

export const useDraftStore = create((set, get) => ({
  drafts: [],
  scheduled: [],
  isLoading: false,
  error: null,
  counts: { drafts: 0, scheduled: 0 },

  // Fetch all drafts
  fetchDrafts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/drafts');
      set({ drafts: response.data.drafts || [], isLoading: false });
    } catch (error) {
      console.error('Failed to fetch drafts:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Fetch scheduled posts
  fetchScheduled: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/drafts/scheduled');
      set({ scheduled: response.data.scheduled || [], isLoading: false });
    } catch (error) {
      console.error('Failed to fetch scheduled:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Fetch counts
  fetchCounts: async () => {
    try {
      const response = await api.get('/drafts/counts/all');
      set({ counts: response.data });
    } catch (error) {
      console.error('Failed to fetch counts:', error);
    }
  },

  // Save draft
  saveDraft: async ({ text, replyTo, quotePost, mediaIds }) => {
    try {
      const response = await api.post('/drafts', {
        text,
        replyTo,
        quotePost,
        mediaIds,
      });
      get().fetchDrafts();
      get().fetchCounts();
      return { success: true, draft: response.data.draft };
    } catch (error) {
      console.error('Failed to save draft:', error);
      return { success: false, error: error.message };
    }
  },

  // Schedule post
  schedulePost: async ({ text, replyTo, quotePost, mediaIds, scheduledAt }) => {
    try {
      const response = await api.post('/drafts', {
        text,
        replyTo,
        quotePost,
        mediaIds,
        scheduledAt,
      });
      get().fetchScheduled();
      get().fetchCounts();
      return { success: true, draft: response.data.draft };
    } catch (error) {
      console.error('Failed to schedule post:', error);
      return { success: false, error: error.message };
    }
  },

  // Update draft
  updateDraft: async (id, updates) => {
    try {
      const response = await api.patch(`/drafts/${id}`, updates);
      get().fetchDrafts();
      get().fetchScheduled();
      return { success: true, draft: response.data.draft };
    } catch (error) {
      console.error('Failed to update draft:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete draft
  deleteDraft: async (id) => {
    try {
      await api.delete(`/drafts/${id}`);
      set(state => ({
        drafts: state.drafts.filter(d => d.id !== id),
        scheduled: state.scheduled.filter(d => d.id !== id),
      }));
      get().fetchCounts();
      return { success: true };
    } catch (error) {
      console.error('Failed to delete draft:', error);
      return { success: false, error: error.message };
    }
  },

  // Post draft now
  postDraft: async (id) => {
    try {
      const response = await api.post(`/drafts/${id}/post`);
      set(state => ({
        drafts: state.drafts.filter(d => d.id !== id),
        scheduled: state.scheduled.filter(d => d.id !== id),
      }));
      get().fetchCounts();
      return { success: true, uri: response.data.uri };
    } catch (error) {
      console.error('Failed to post draft:', error);
      return { success: false, error: error.message };
    }
  },

  // Clear all
  clear: () => {
    set({ drafts: [], scheduled: [], counts: { drafts: 0, scheduled: 0 } });
  },
}));

export default useDraftStore;

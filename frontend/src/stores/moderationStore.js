import { create } from 'zustand';
import api from '../services/api';

export const useModerationStore = create((set, get) => ({
  blockedUsers: [],
  mutedUsers: [],
  mutedWords: [],
  isLoading: false,
  error: null,

  // Blocked Users
  fetchBlockedUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/moderation/blocked');
      set({ blockedUsers: response.data.blockedUsers || [], isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  blockUser: async (did) => {
    try {
      const response = await api.post(`/moderation/block/${did}`);
      set((state) => ({
        blockedUsers: [...state.blockedUsers, response.data.block],
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  unblockUser: async (did) => {
    try {
      await api.delete(`/moderation/block/${did}`);
      set((state) => ({
        blockedUsers: state.blockedUsers.filter((b) => b.blockedDid !== did),
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Muted Users
  fetchMutedUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/moderation/muted');
      set({ mutedUsers: response.data.mutedUsers || [], isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  muteUser: async (did, duration = null) => {
    try {
      const response = await api.post(`/moderation/mute/${did}`, { duration });
      set((state) => ({
        mutedUsers: [...state.mutedUsers, response.data.mute],
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  unmuteUser: async (did) => {
    try {
      await api.delete(`/moderation/mute/${did}`);
      set((state) => ({
        mutedUsers: state.mutedUsers.filter((m) => m.mutedDid !== did),
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Muted Words
  fetchMutedWords: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/moderation/muted-words');
      set({ mutedWords: response.data.mutedWords || [], isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addMutedWord: async (word, isRegex = false, duration = null) => {
    try {
      const response = await api.post('/moderation/muted-words', {
        word,
        isRegex,
        duration,
      });
      set((state) => ({
        mutedWords: [...state.mutedWords, response.data.mutedWord],
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  removeMutedWord: async (id) => {
    try {
      await api.delete(`/moderation/muted-words/${id}`);
      set((state) => ({
        mutedWords: state.mutedWords.filter((w) => w.id !== id),
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Reporting
  reportPost: async (postUri, postCid, reasonType, reason = '') => {
    try {
      await api.post('/moderation/report/post', {
        postUri,
        postCid,
        reasonType,
        reason,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  reportAccount: async (did, reasonType, reason = '') => {
    try {
      await api.post('/moderation/report/account', {
        did,
        reasonType,
        reason,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Fetch all moderation data
  fetchAll: async () => {
    const { fetchBlockedUsers, fetchMutedUsers, fetchMutedWords } = get();
    await Promise.all([
      fetchBlockedUsers(),
      fetchMutedUsers(),
      fetchMutedWords(),
    ]);
  },
}));

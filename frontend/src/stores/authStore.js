import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

// Track if auth check is in progress to prevent duplicate checks
let authCheckInProgress = false;

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,

      login: async (identifier, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { identifier, password });
          const { user, token } = response.data;

          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ user, token, isLoading: false, isAuthenticated: true });

          return { success: true };
        } catch (error) {
          const message = error.response?.data?.error || 'Login failed';
          set({ error: message, isLoading: false, isAuthenticated: false });
          return { success: false, error: message };
        }
      },

      logout: async () => {
        // Clear state immediately to prevent any further authenticated requests
        const hadToken = !!get().token;
        set({ user: null, token: null, isAuthenticated: false });
        delete api.defaults.headers.common['Authorization'];

        // Then try to notify server (don't await, don't care if it fails)
        if (hadToken) {
          api.post('/auth/logout').catch(() => {});
        }
      },

      checkAuth: async () => {
        // Prevent duplicate auth checks
        if (authCheckInProgress) {
          return;
        }

        const { token } = get();
        if (!token) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        authCheckInProgress = true;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        try {
          const response = await api.get('/auth/me');
          set({ user: response.data.user, isLoading: false, isAuthenticated: true });
        } catch (error) {
          // Auth failed - clear everything immediately
          set({ user: null, token: null, isLoading: false, isAuthenticated: false });
          delete api.defaults.headers.common['Authorization'];
        } finally {
          authCheckInProgress = false;
        }
      },

      updateUser: (updates) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },

      clearError: () => set({ error: null }),

      // Helper to check if we should make authenticated requests
      canMakeAuthenticatedRequests: () => {
        const { isAuthenticated, isLoading } = get();
        return isAuthenticated && !isLoading;
      },
    }),
    {
      name: 'skydeck-auth',
      partialize: (state) => ({ token: state.token }),
      // Set Authorization header immediately when store is rehydrated from localStorage
      // This ensures the token is available for any API calls that happen before checkAuth completes
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);

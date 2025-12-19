import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,
      error: null,

      login: async (identifier, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { identifier, password });
          const { user, token } = response.data;

          set({ user, token, isLoading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          return { success: true };
        } catch (error) {
          const message = error.response?.data?.error || 'Login failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        }
        set({ user: null, token: null });
        delete api.defaults.headers.common['Authorization'];
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          set({ isLoading: false });
          return;
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        try {
          const response = await api.get('/auth/me');
          set({ user: response.data.user, isLoading: false });
        } catch (error) {
          set({ user: null, token: null, isLoading: false });
          delete api.defaults.headers.common['Authorization'];
        }
      },

      updateUser: (updates) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'skydeck-auth',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const defaultTheme = {
  name: 'Dark',
  mode: 'dark',
  primaryColor: '#0085ff',
  secondaryColor: '#6366f1',
  accentColor: '#22c55e',
  bgPrimary: '#000000',
  bgSecondary: '#16181c',
  bgTertiary: '#1d1f23',
  textPrimary: '#e7e9ea',
  textSecondary: '#71767b',
  textMuted: '#536471',
  borderColor: '#2f3336',
  fontFamily: 'system-ui',
  fontSize: 'medium',
  columnWidth: 350,
  columnGap: 8,
  compactMode: false,
  customCss: '',
};

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: defaultTheme,
      presets: [],
      isLoading: false,

      setTheme: (updates) => {
        set((state) => ({
          theme: { ...state.theme, ...updates },
        }));
      },

      fetchTheme: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/themes');
          if (response.data.theme) {
            set({ theme: { ...defaultTheme, ...response.data.theme } });
          }
        } catch (error) {
          console.error('Fetch theme error:', error);
        }
        set({ isLoading: false });
      },

      saveTheme: async () => {
        const { theme } = get();
        // Only send the fields that the server expects
        const themeData = {
          name: theme.name,
          mode: theme.mode,
          primaryColor: theme.primaryColor,
          secondaryColor: theme.secondaryColor,
          accentColor: theme.accentColor,
          bgPrimary: theme.bgPrimary,
          bgSecondary: theme.bgSecondary,
          bgTertiary: theme.bgTertiary,
          textPrimary: theme.textPrimary,
          textSecondary: theme.textSecondary,
          textMuted: theme.textMuted,
          borderColor: theme.borderColor,
          fontFamily: theme.fontFamily,
          fontSize: theme.fontSize,
          columnWidth: theme.columnWidth,
          columnGap: theme.columnGap,
          compactMode: theme.compactMode,
          customCss: theme.customCss || '',
        };
        try {
          const response = await api.patch('/themes', themeData);
          // Update store with server response to ensure sync
          if (response.data.theme) {
            set({ theme: { ...theme, ...response.data.theme } });
          }
          return { success: true };
        } catch (error) {
          console.error('Save theme error:', error);
          return { success: false, error: error.message };
        }
      },

      resetTheme: async () => {
        try {
          const response = await api.post('/themes/reset');
          set({ theme: { ...defaultTheme, ...response.data.theme } });
          return { success: true };
        } catch (error) {
          console.error('Reset theme error:', error);
          return { success: false, error: error.message };
        }
      },

      fetchPresets: async () => {
        try {
          const response = await api.get('/themes/presets');
          set({ presets: response.data.presets });
        } catch (error) {
          console.error('Fetch presets error:', error);
        }
      },

      applyPreset: (preset) => {
        set((state) => ({
          theme: { ...state.theme, ...preset },
        }));
      },

      exportTheme: () => {
        const { theme } = get();
        const { id, userId, createdAt, updatedAt, ...exportable } = theme;
        return exportable;
      },

      importTheme: async (importedTheme) => {
        try {
          const response = await api.post('/themes/import', { theme: importedTheme });
          set({ theme: { ...defaultTheme, ...response.data.theme } });
          return { success: true };
        } catch (error) {
          console.error('Import theme error:', error);
          return { success: false, error: error.message };
        }
      },

      applyTheme: (theme) => {
        const root = document.documentElement;

        root.style.setProperty('--color-primary', theme.primaryColor);
        root.style.setProperty('--color-secondary', theme.secondaryColor);
        root.style.setProperty('--color-accent', theme.accentColor);
        root.style.setProperty('--color-bg-primary', theme.bgPrimary);
        root.style.setProperty('--color-bg-secondary', theme.bgSecondary);
        root.style.setProperty('--color-bg-tertiary', theme.bgTertiary);
        root.style.setProperty('--color-text-primary', theme.textPrimary);
        root.style.setProperty('--color-text-secondary', theme.textSecondary);
        root.style.setProperty('--color-text-muted', theme.textMuted);
        root.style.setProperty('--color-border', theme.borderColor);
        root.style.setProperty('--font-family', theme.fontFamily);
        root.style.setProperty('--column-width', `${theme.columnWidth}px`);
        root.style.setProperty('--column-gap', `${theme.columnGap}px`);

        // Font size
        const fontSizes = { small: '14px', medium: '15px', large: '16px' };
        root.style.setProperty('--font-size', fontSizes[theme.fontSize] || '15px');

        // Apply custom CSS
        let customStyle = document.getElementById('custom-theme-css');
        if (theme.customCss) {
          if (!customStyle) {
            customStyle = document.createElement('style');
            customStyle.id = 'custom-theme-css';
            document.head.appendChild(customStyle);
          }
          customStyle.textContent = theme.customCss;
        } else if (customStyle) {
          customStyle.remove();
        }

        // Compact mode
        if (theme.compactMode) {
          document.body.classList.add('compact');
        } else {
          document.body.classList.remove('compact');
        }
      },
    }),
    {
      name: 'skydeck-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

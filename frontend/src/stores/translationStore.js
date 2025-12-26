import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import translateService from '../services/translate';

export const useTranslationStore = create(
  persist(
    (set, get) => ({
      // User's preferred language for translations
      preferredLanguage: 'en',

      // Cache of translated posts { [postUri]: { text, language } }
      translations: {},

      // Available languages (loaded from API)
      languages: [],

      // Loading state
      isLoading: false,

      setPreferredLanguage: (lang) => {
        set({ preferredLanguage: lang });
      },

      fetchLanguages: async () => {
        try {
          const languages = await translateService.getLanguages();
          set({ languages });
        } catch (error) {
          console.error('Failed to fetch languages:', error);
        }
      },

      // Translate a post and cache the result
      translatePost: async (postUri, text) => {
        const { preferredLanguage, translations } = get();

        // Check cache first
        const cached = translations[postUri];
        if (cached && cached.language === preferredLanguage) {
          return { success: true, ...cached };
        }

        set({ isLoading: true });

        try {
          const result = await translateService.translate(text, preferredLanguage);

          // Cache the translation
          set((state) => ({
            translations: {
              ...state.translations,
              [postUri]: {
                text: result.translatedText,
                language: preferredLanguage,
                detectedLanguage: result.detectedLanguage,
              },
            },
          }));

          set({ isLoading: false });
          return { success: true, text: result.translatedText, detectedLanguage: result.detectedLanguage };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // Get cached translation for a post
      getTranslation: (postUri) => {
        const { translations, preferredLanguage } = get();
        const cached = translations[postUri];
        if (cached && cached.language === preferredLanguage) {
          return cached;
        }
        return null;
      },

      // Clear translation cache
      clearCache: () => {
        set({ translations: {} });
      },
    }),
    {
      name: 'skydeck-translations',
      partialize: (state) => ({
        preferredLanguage: state.preferredLanguage,
        // Don't persist the translation cache - it can get large
      }),
    }
  )
);

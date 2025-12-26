import NodeCache from 'node-cache';

// Cache translations for 24 hours to avoid redundant API calls
const translationCache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

// LibreTranslate configuration from environment
const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com';
const LIBRETRANSLATE_API_KEY = process.env.LIBRETRANSLATE_API_KEY || '';

// Fallback instances (only used if no API key is configured)
const LIBRETRANSLATE_FALLBACK_INSTANCES = [
  'https://translate.argosopentech.com',
  'https://translate.terraprint.co',
];

// Supported languages (common ones)
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'tr', name: 'Turkish' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'th', name: 'Thai' },
  { code: 'id', name: 'Indonesian' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'cs', name: 'Czech' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'el', name: 'Greek' },
  { code: 'he', name: 'Hebrew' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'no', name: 'Norwegian' },
  { code: 'ro', name: 'Romanian' },
  { code: 'sk', name: 'Slovak' },
  { code: 'bg', name: 'Bulgarian' },
];

class TranslationService {
  constructor() {
    this.currentFallbackIndex = 0;
  }

  // Get the list of instances to try
  getInstances() {
    // If API key is configured, only use the configured URL
    if (LIBRETRANSLATE_API_KEY) {
      return [LIBRETRANSLATE_URL];
    }
    // Otherwise, try fallback instances (which may or may not require keys)
    return [LIBRETRANSLATE_URL, ...LIBRETRANSLATE_FALLBACK_INSTANCES];
  }

  // Get cache key for a translation
  getCacheKey(text, targetLang, sourceLang) {
    const textHash = Buffer.from(text).toString('base64').slice(0, 50);
    return `trans:${sourceLang || 'auto'}:${targetLang}:${textHash}`;
  }

  // Check if translation service is configured
  isConfigured() {
    return !!LIBRETRANSLATE_API_KEY;
  }

  // Try to translate using LibreTranslate instances with fallback
  async translate(text, targetLang, sourceLang = 'auto') {
    if (!text || !text.trim()) {
      return { success: false, error: 'No text provided' };
    }

    // Check cache first
    const cacheKey = this.getCacheKey(text, targetLang, sourceLang);
    const cached = translationCache.get(cacheKey);
    if (cached) {
      return { success: true, ...cached, cached: true };
    }

    const instances = this.getInstances();

    // Try each instance until one works
    let lastError = null;
    for (let i = 0; i < instances.length; i++) {
      const instanceIndex = (this.currentFallbackIndex + i) % instances.length;
      const instance = instances[instanceIndex];

      try {
        const result = await this.translateWithInstance(instance, text, targetLang, sourceLang);
        if (result.success) {
          // Cache the result
          translationCache.set(cacheKey, {
            translatedText: result.translatedText,
            detectedLanguage: result.detectedLanguage,
            targetLanguage: targetLang,
          });
          // Update preferred instance
          this.currentFallbackIndex = instanceIndex;
          return result;
        }
        lastError = result.error;
      } catch (error) {
        lastError = error.message;
        console.error(`Translation failed with ${instance}:`, error.message);
      }
    }

    return { success: false, error: lastError || 'Translation failed' };
  }

  // Translate using a specific LibreTranslate instance
  async translateWithInstance(instance, text, targetLang, sourceLang) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const requestBody = {
        q: text,
        source: sourceLang === 'auto' ? 'auto' : sourceLang,
        target: targetLang,
        format: 'text',
      };

      // Include API key if configured
      if (LIBRETRANSLATE_API_KEY) {
        requestBody.api_key = LIBRETRANSLATE_API_KEY;
      }

      const response = await fetch(`${instance}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        translatedText: data.translatedText,
        detectedLanguage: data.detectedLanguage?.language || sourceLang,
        targetLanguage: targetLang,
      };
    } catch (error) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        throw new Error('Translation request timed out');
      }
      throw error;
    }
  }

  // Detect language of text
  async detectLanguage(text) {
    if (!text || !text.trim()) {
      return { success: false, error: 'No text provided' };
    }

    const instances = this.getInstances();

    for (let i = 0; i < instances.length; i++) {
      const instanceIndex = (this.currentFallbackIndex + i) % instances.length;
      const instance = instances[instanceIndex];

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const requestBody = { q: text };

        // Include API key if configured
        if (LIBRETRANSLATE_API_KEY) {
          requestBody.api_key = LIBRETRANSLATE_API_KEY;
        }

        const response = await fetch(`${instance}/detect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            return {
              success: true,
              language: data[0].language,
              confidence: data[0].confidence,
            };
          }
        }
      } catch (error) {
        console.error(`Language detection failed with ${instance}:`, error.message);
      }
    }

    return { success: false, error: 'Language detection failed' };
  }

  // Get list of supported languages
  getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  }

  // Clear translation cache
  clearCache() {
    translationCache.flushAll();
  }

  // Get cache stats
  getCacheStats() {
    return translationCache.getStats();
  }
}

export const translationService = new TranslationService();
export default translationService;

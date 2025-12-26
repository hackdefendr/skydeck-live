import api from './api';

const translateService = {
  // Translate text to target language
  async translate(text, targetLang, sourceLang = 'auto') {
    const response = await api.post('/translate', {
      text,
      targetLang,
      sourceLang,
    });
    return response.data;
  },

  // Detect language of text
  async detectLanguage(text) {
    const response = await api.post('/translate/detect', { text });
    return response.data;
  },

  // Get supported languages
  async getLanguages() {
    const response = await api.get('/translate/languages');
    return response.data.languages;
  },
};

export default translateService;

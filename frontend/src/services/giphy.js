import api from './api';

export const giphyService = {
  // Search GIFs
  async search(query, { limit = 25, offset = 0 } = {}) {
    const response = await api.get('/giphy/search', {
      params: { q: query, limit, offset },
    });
    return response.data;
  },

  // Get trending GIFs
  async trending({ limit = 25, offset = 0 } = {}) {
    const response = await api.get('/giphy/trending', {
      params: { limit, offset },
    });
    return response.data;
  },
};

export default giphyService;

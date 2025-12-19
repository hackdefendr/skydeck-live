import api from './api';

export const feedsService = {
  // Get home timeline
  async getTimeline({ limit = 50, cursor } = {}) {
    const response = await api.get('/feeds/timeline', {
      params: { limit, cursor },
    });
    return response.data;
  },

  // Get custom feed
  async getFeed(feedUri, { limit = 50, cursor } = {}) {
    const response = await api.get(`/feeds/feed/${encodeURIComponent(feedUri)}`, {
      params: { limit, cursor },
    });
    return response.data;
  },

  // Get list feed
  async getListFeed(listUri, { limit = 50, cursor } = {}) {
    const response = await api.get(`/feeds/list/${encodeURIComponent(listUri)}`, {
      params: { limit, cursor },
    });
    return response.data;
  },

  // Get suggested feeds
  async getSuggestedFeeds({ limit = 50, cursor } = {}) {
    const response = await api.get('/feeds/suggested', {
      params: { limit, cursor },
    });
    return response.data;
  },

  // Get saved feeds
  async getSavedFeeds() {
    const response = await api.get('/feeds/saved');
    return response.data.feeds;
  },

  // Get mentions
  async getMentions({ limit = 50, cursor } = {}) {
    const response = await api.get('/feeds/mentions', {
      params: { limit, cursor },
    });
    return response.data;
  },
};

export default feedsService;

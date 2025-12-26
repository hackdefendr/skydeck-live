import api from './api';

export const usersService = {
  // Get user profile
  async getProfile(actor) {
    const response = await api.get(`/users/${actor}`);
    return response.data.profile;
  },

  // Get user's followers
  async getFollowers(actor, { limit = 50, cursor } = {}) {
    const response = await api.get(`/users/${actor}/followers`, {
      params: { limit, cursor },
    });
    return response.data;
  },

  // Get user's follows
  async getFollows(actor, { limit = 50, cursor } = {}) {
    const response = await api.get(`/users/${actor}/follows`, {
      params: { limit, cursor },
    });
    return response.data;
  },

  // Get suggested follows based on an actor
  async getSuggestedFollows(actor) {
    const response = await api.get(`/users/${actor}/suggested-follows`);
    return response.data.suggestions || [];
  },

  // Get known/mutual followers
  async getKnownFollowers(actor, { limit = 50, cursor } = {}) {
    const response = await api.get(`/users/${actor}/known-followers`, {
      params: { limit, cursor },
    });
    return response.data;
  },

  // Follow a user
  async follow(did) {
    const response = await api.post(`/users/${did}/follow`);
    return response.data;
  },

  // Unfollow a user
  async unfollow(did, followUri) {
    await api.delete(`/users/${did}/follow`, {
      data: { followUri },
    });
  },

  // Get user's starter packs
  async getStarterPacks(actor, { limit = 50, cursor } = {}) {
    const response = await api.get(`/users/${actor}/starter-packs`, {
      params: { limit, cursor },
    });
    return response.data;
  },

  // Search starter packs
  async searchStarterPacks(query, { limit = 25, cursor } = {}) {
    const response = await api.get('/search/starter-packs', {
      params: { q: query, limit, cursor },
    });
    return response.data;
  },

  // Get a specific starter pack
  async getStarterPack(uri) {
    const response = await api.get('/search/starter-pack', {
      params: { uri },
    });
    return response.data.starterPack;
  },
};

export default usersService;

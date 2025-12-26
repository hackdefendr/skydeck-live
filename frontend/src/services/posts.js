import api from './api';

export const postsService = {
  // Create a new post
  async createPost({ text, replyTo, quoteUri, embed, langs }) {
    const response = await api.post('/posts', {
      text,
      replyTo,
      quoteUri,
      embed,
      langs,
    });
    return response.data;
  },

  // Get post thread
  async getPostThread(uri, { depth = 10, parentHeight = 80 } = {}) {
    const response = await api.get(`/posts/${encodeURIComponent(uri)}`, {
      params: { depth, parentHeight },
    });
    return response.data.thread;
  },

  // Delete a post
  async deletePost(uri) {
    await api.delete(`/posts/${encodeURIComponent(uri)}`);
  },

  // Like a post
  async likePost(uri, cid) {
    const response = await api.post(`/posts/${encodeURIComponent(uri)}/like`, { cid });
    return response.data;
  },

  // Unlike a post
  async unlikePost(uri, likeUri) {
    await api.delete(`/posts/${encodeURIComponent(uri)}/like`, {
      data: { likeUri },
    });
  },

  // Repost
  async repost(uri, cid) {
    const response = await api.post(`/posts/${encodeURIComponent(uri)}/repost`, { cid });
    return response.data;
  },

  // Delete repost
  async deleteRepost(uri, repostUri) {
    await api.delete(`/posts/${encodeURIComponent(uri)}/repost`, {
      data: { repostUri },
    });
  },

  // Mute a thread
  async muteThread(uri) {
    const response = await api.post(`/posts/${encodeURIComponent(uri)}/mute-thread`);
    return response.data;
  },

  // Unmute a thread
  async unmuteThread(uri) {
    await api.delete(`/posts/${encodeURIComponent(uri)}/mute-thread`);
  },
};

export default postsService;

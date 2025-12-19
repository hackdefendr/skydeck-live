import api from './api';

export const authService = {
  async login(identifier, password) {
    const response = await api.post('/auth/login', { identifier, password });
    return response.data;
  },

  async logout() {
    await api.post('/auth/logout');
  },

  async logoutAll() {
    await api.post('/auth/logout-all');
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  async getSessions() {
    const response = await api.get('/auth/sessions');
    return response.data.sessions;
  },

  async revokeSession(sessionId) {
    await api.delete(`/auth/sessions/${sessionId}`);
  },

  async refreshToken() {
    await api.post('/auth/refresh');
  },
};

export default authService;

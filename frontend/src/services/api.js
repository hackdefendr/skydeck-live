import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get token from localStorage (zustand persisted store)
const getStoredToken = () => {
  try {
    const stored = localStorage.getItem('skydeck-auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.token || null;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
};

// Request interceptor - ensure token is always included if available
api.interceptors.request.use(
  (config) => {
    // Always check for token in localStorage and add to headers
    // This ensures the token is included even if the store hasn't been rehydrated yet
    if (!config.headers.Authorization) {
      const token = getStoredToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Track if we're already handling an auth error to prevent loops
let isHandlingAuthError = false;

// Response interceptor - handle 401 errors by clearing stale tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized responses
    if (error.response?.status === 401 && !isHandlingAuthError) {
      isHandlingAuthError = true;

      // Clear the stored token to prevent further failed requests
      const errorCode = error.response?.data?.code;

      // Only clear tokens for actual auth failures, not for login attempts
      if (errorCode === 'INVALID_TOKEN' ||
          errorCode === 'SESSION_INVALID' ||
          errorCode === 'USER_NOT_FOUND') {
        console.log('[API] Auth error detected, clearing stale token:', errorCode);

        // Clear token from axios headers
        delete api.defaults.headers.common['Authorization'];

        // Clear token from localStorage
        try {
          const stored = localStorage.getItem('skydeck-auth');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.state) {
              parsed.state.token = null;
              parsed.state.isAuthenticated = false;
              parsed.state.user = null;
              localStorage.setItem('skydeck-auth', JSON.stringify(parsed));
            }
          }
        } catch {
          // Ignore errors
        }

        // Trigger a page reload to reset state (simpler than event-based approach)
        // Only if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      // Reset the flag after a short delay
      setTimeout(() => {
        isHandlingAuthError = false;
      }, 1000);
    }

    return Promise.reject(error);
  }
);

export default api;

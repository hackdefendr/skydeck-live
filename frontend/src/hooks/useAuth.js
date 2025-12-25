import { useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const { user, isLoading, error, login, logout, updateUser, clearError } = useAuthStore();

  const isAuthenticated = !!user;

  const handleLogin = useCallback(async (identifier, password, options = {}) => {
    return login(identifier, password, options);
  }, [login]);

  const handleLogout = useCallback(async () => {
    return logout();
  }, [logout]);

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login: handleLogin,
    logout: handleLogout,
    updateUser,
    clearError,
  };
}

export default useAuth;

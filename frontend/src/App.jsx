import { useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import { useFavicon } from './hooks/useFavicon';
import Home from './pages/Home';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Loading from './components/common/Loading';

function App() {
  const { user, isLoading, isAuthenticated, checkAuth } = useAuthStore();
  const { theme, applyTheme, fetchTheme } = useThemeStore();
  const { updateFavicon } = useFavicon();
  const hasCheckedAuth = useRef(false);
  const hasFetchedTheme = useRef(false);

  // Check auth only once on mount
  useEffect(() => {
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      checkAuth();
    }
  }, [checkAuth]);

  // Fetch theme only after authentication is confirmed
  useEffect(() => {
    if (isAuthenticated && !isLoading && !hasFetchedTheme.current) {
      hasFetchedTheme.current = true;
      fetchTheme();
    }
    // Reset when logged out
    if (!isAuthenticated && !isLoading) {
      hasFetchedTheme.current = false;
    }
  }, [isAuthenticated, isLoading, fetchTheme]);

  // Apply theme (this doesn't require auth)
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Update favicon when logo variant changes
  useEffect(() => {
    updateFavicon();
  }, [theme.logoVariant, updateFavicon]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/settings"
        element={isAuthenticated ? <Settings /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

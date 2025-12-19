import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import Home from './pages/Home';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Loading from './components/common/Loading';

function App() {
  const { user, isLoading, checkAuth } = useAuthStore();
  const { theme, applyTheme, fetchTheme } = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      fetchTheme();
    }
  }, [user, fetchTheme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

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
        element={user ? <Home /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/settings"
        element={user ? <Settings /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to handle auto-refresh functionality for columns
 * @param {Function} refreshFn - The function to call for refresh
 * @param {number} intervalSeconds - Refresh interval in seconds (0 = disabled)
 * @param {boolean} enabled - Whether auto-refresh is enabled
 */
export function useAutoRefresh(refreshFn, intervalSeconds, enabled = true) {
  const intervalRef = useRef(null);
  const refreshFnRef = useRef(refreshFn);

  // Keep the refresh function ref up to date
  useEffect(() => {
    refreshFnRef.current = refreshFn;
  }, [refreshFn]);

  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (intervalSeconds > 0 && enabled) {
      intervalRef.current = setInterval(() => {
        refreshFnRef.current?.();
      }, intervalSeconds * 1000);
    }
  }, [intervalSeconds, enabled]);

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Setup/cleanup auto-refresh
  useEffect(() => {
    startAutoRefresh();
    return stopAutoRefresh;
  }, [startAutoRefresh, stopAutoRefresh]);

  // Handle visibility change - pause when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAutoRefresh();
      } else {
        startAutoRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startAutoRefresh, stopAutoRefresh]);

  return {
    startAutoRefresh,
    stopAutoRefresh,
  };
}

export default useAutoRefresh;

import { useEffect, useCallback } from 'react';
import { useFeedStore } from '../stores/feedStore';

export function useFeed(columnId) {
  const {
    feeds,
    loading,
    errors,
    cursors,
    fetchFeed,
    refreshFeed,
    loadMore,
    addToFeed,
    removeFromFeed,
    updateInFeed,
  } = useFeedStore();

  const feed = feeds[columnId] || [];
  const isLoading = loading[columnId] || false;
  const error = errors[columnId] || null;
  const hasMore = !!cursors[columnId];

  useEffect(() => {
    if (columnId && feed.length === 0) {
      fetchFeed(columnId);
    }
  }, [columnId, feed.length, fetchFeed]);

  const refresh = useCallback(() => {
    return refreshFeed(columnId);
  }, [columnId, refreshFeed]);

  const loadNext = useCallback(() => {
    if (hasMore && !isLoading) {
      return loadMore(columnId);
    }
  }, [columnId, hasMore, isLoading, loadMore]);

  const addItem = useCallback((item, prepend = true) => {
    addToFeed(columnId, [item], prepend);
  }, [columnId, addToFeed]);

  const removeItem = useCallback((itemUri) => {
    removeFromFeed(columnId, itemUri);
  }, [columnId, removeFromFeed]);

  const updateItem = useCallback((itemUri, updates) => {
    updateInFeed(columnId, itemUri, updates);
  }, [columnId, updateInFeed]);

  return {
    feed,
    isLoading,
    error,
    hasMore,
    refresh,
    loadMore: loadNext,
    addItem,
    removeItem,
    updateItem,
  };
}

export default useFeed;

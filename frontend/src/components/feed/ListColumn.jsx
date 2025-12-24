import { useEffect, useCallback, useRef } from 'react';
import { useFeed } from '../../hooks/useFeed';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import Post from '../posts/Post';
import Loading from '../common/Loading';

function ListColumn({ column }) {
  const { feed, isLoading, error, hasMore, refresh, loadMore } = useFeed(column.id);
  const containerRef = useRef(null);

  // Auto-refresh based on column settings (default: 60 seconds)
  useAutoRefresh(refresh, column.refreshInterval ?? 60, true);

  // Infinite scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      loadMore();
    }
  }, [isLoading, hasMore, loadMore]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  if (isLoading && feed.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="column-content">
      {/* List info header */}
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-text-primary">{column.title}</h3>
        {column.listUri && (
          <p className="text-sm text-text-muted truncate">{column.listUri}</p>
        )}
      </div>

      {/* Feed items */}
      {feed.map((item, index) => (
        <Post key={item.post?.uri || index} item={item} />
      ))}

      {/* Load more indicator */}
      {isLoading && feed.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <Loading size="md" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && feed.length === 0 && (
        <div className="flex items-center justify-center py-8 text-text-muted">
          <p>No posts in this list</p>
        </div>
      )}
    </div>
  );
}

export default ListColumn;

import { useState, useEffect, useCallback, useRef } from 'react';
import { useFeed } from '../../hooks/useFeed';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import Post from '../posts/Post';
import PostViewer from '../posts/PostViewer';
import SlideOutComposer from '../posts/SlideOutComposer';
import Loading from '../common/Loading';

function FeedColumn({ column }) {
  const { feed, isLoading, error, hasMore, refresh, loadMore } = useFeed(column.id);
  const containerRef = useRef(null);

  // Post viewer state
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostViewer, setShowPostViewer] = useState(false);

  // Composer state for reply/quote
  const [showComposer, setShowComposer] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [quotePost, setQuotePost] = useState(null);

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

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setShowPostViewer(true);
  };

  const handleReply = (post) => {
    setReplyTo({
      uri: post.uri,
      cid: post.cid,
      handle: post.author?.handle,
      root: post.record?.reply?.root || { uri: post.uri, cid: post.cid },
      parent: { uri: post.uri, cid: post.cid },
    });
    setQuotePost(null);
    setShowComposer(true);
  };

  const handleQuote = (post) => {
    setQuotePost(post);
    setReplyTo(null);
    setShowComposer(true);
  };

  const handleCloseComposer = () => {
    setShowComposer(false);
    setReplyTo(null);
    setQuotePost(null);
  };

  return (
    <>
      <div
        ref={containerRef}
        className="column-content"
      >
        {/* Loading state */}
        {isLoading && feed.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <Loading size="lg" />
          </div>
        )}

        {/* Error state */}
        {error && feed.length === 0 && (
          <div className="flex items-center justify-center py-8 text-text-muted">
            <p>Failed to load feed</p>
          </div>
        )}

        {/* Feed items */}
        {feed.map((item, index) => (
          <Post
            key={item.post?.uri || item.uri || index}
            item={item}
            onClick={handlePostClick}
            onReply={handleReply}
            onQuote={handleQuote}
          />
        ))}

        {/* Load more indicator */}
        {isLoading && feed.length > 0 && (
          <div className="flex items-center justify-center py-4">
            <Loading size="md" />
          </div>
        )}

        {/* End of feed */}
        {!hasMore && feed.length > 0 && (
          <div className="text-center py-8 text-text-muted text-sm">
            You've reached the end
          </div>
        )}

        {/* Empty state */}
        {!isLoading && feed.length === 0 && !error && (
          <div className="flex items-center justify-center py-8 text-text-muted">
            <p>No posts yet</p>
          </div>
        )}
      </div>

      {/* Post Viewer Modal */}
      <PostViewer
        post={selectedPost}
        isOpen={showPostViewer}
        onClose={() => setShowPostViewer(false)}
        onReply={handleReply}
        onQuote={handleQuote}
      />

      {/* Reply/Quote Composer */}
      <SlideOutComposer
        isOpen={showComposer}
        onClose={handleCloseComposer}
        replyTo={replyTo}
        quotePost={quotePost}
      />
    </>
  );
}

export default FeedColumn;

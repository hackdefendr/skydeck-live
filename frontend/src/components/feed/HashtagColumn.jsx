import { useState, useEffect, useCallback, useRef } from 'react';
import { useFeed } from '../../hooks/useFeed';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { useKeyboardStore } from '../../stores/keyboardStore';
import Post from '../posts/Post';
import PostViewer from '../posts/PostViewer';
import SlideOutComposer from '../posts/SlideOutComposer';
import Loading from '../common/Loading';
import { Hash } from 'lucide-react';

function HashtagColumn({ column }) {
  const { feed, isLoading, error, hasMore, refresh, loadMore } = useFeed(column.id);
  const containerRef = useRef(null);
  const { registerColumnRef, unregisterColumnRef } = useKeyboardStore();

  // Post viewer state
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostViewer, setShowPostViewer] = useState(false);

  // Composer state for reply/quote
  const [showComposer, setShowComposer] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [quotePost, setQuotePost] = useState(null);

  // Register scroll container ref for keyboard navigation
  useEffect(() => {
    registerColumnRef(column.id, containerRef);
    return () => unregisterColumnRef(column.id);
  }, [column.id, registerColumnRef, unregisterColumnRef]);

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

  // Format hashtag for display
  const displayHashtag = column.hashtag?.startsWith('#')
    ? column.hashtag
    : `#${column.hashtag || ''}`;

  return (
    <>
      <div
        ref={containerRef}
        className="column-content"
      >
        {/* Hashtag header */}
        <div className="sticky top-0 z-10 bg-bg-secondary/95 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Hash className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-lg">
                {displayHashtag}
              </h3>
              <p className="text-xs text-text-muted">
                {feed.length} {feed.length === 1 ? 'post' : 'posts'}
              </p>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && feed.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <Loading size="lg" />
          </div>
        )}

        {/* Error state */}
        {error && feed.length === 0 && (
          <div className="flex items-center justify-center py-8 text-text-muted">
            <p>Failed to load posts</p>
          </div>
        )}

        {/* Feed items - hashtag search returns posts directly */}
        {feed.map((item, index) => {
          // Handle both direct posts and wrapped posts
          const post = item.post || item;
          return (
            <Post
              key={post.uri || index}
              item={{ post }}
              onClick={handlePostClick}
              onReply={handleReply}
              onQuote={handleQuote}
            />
          );
        })}

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
          <div className="flex flex-col items-center justify-center py-12 text-text-muted">
            <Hash className="w-12 h-12 mb-3 opacity-50" />
            <p className="font-medium">No posts found</p>
            <p className="text-sm mt-1">Be the first to post with {displayHashtag}</p>
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

export default HashtagColumn;

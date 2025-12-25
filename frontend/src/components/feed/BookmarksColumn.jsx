import { useState, useEffect, useCallback, useRef } from 'react';
import { useBookmarkStore } from '../../stores/bookmarkStore';
import { useKeyboardStore } from '../../stores/keyboardStore';
import Post from '../posts/Post';
import PostViewer from '../posts/PostViewer';
import SlideOutComposer from '../posts/SlideOutComposer';
import Loading from '../common/Loading';
import { Bookmark } from 'lucide-react';

function BookmarksColumn({ column }) {
  const {
    bookmarks,
    isLoading,
    error,
    hasMore,
    fetchBookmarks,
  } = useBookmarkStore();

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

  // Fetch bookmarks on mount
  useEffect(() => {
    fetchBookmarks(true);
  }, [fetchBookmarks]);

  // Infinite scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      fetchBookmarks(false);
    }
  }, [isLoading, hasMore, fetchBookmarks]);

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
        {isLoading && bookmarks.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <Loading size="lg" />
          </div>
        )}

        {/* Error state */}
        {error && bookmarks.length === 0 && (
          <div className="flex items-center justify-center py-8 text-text-muted">
            <p>Failed to load bookmarks</p>
          </div>
        )}

        {/* Bookmarked posts */}
        {bookmarks.map((item, index) => (
          <Post
            key={item.post?.uri || index}
            item={{ post: item.post }}
            onClick={handlePostClick}
            onReply={handleReply}
            onQuote={handleQuote}
          />
        ))}

        {/* Load more indicator */}
        {isLoading && bookmarks.length > 0 && (
          <div className="flex items-center justify-center py-4">
            <Loading size="md" />
          </div>
        )}

        {/* End of bookmarks */}
        {!hasMore && bookmarks.length > 0 && (
          <div className="text-center py-8 text-text-muted text-sm">
            You've reached the end
          </div>
        )}

        {/* Empty state */}
        {!isLoading && bookmarks.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted">
            <Bookmark className="w-12 h-12 mb-3 opacity-50" />
            <p className="font-medium">No bookmarks yet</p>
            <p className="text-sm mt-1">Posts you bookmark will appear here</p>
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

export default BookmarksColumn;

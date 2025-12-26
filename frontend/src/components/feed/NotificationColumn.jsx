import { useState, useEffect, useCallback, useRef } from 'react';
import { Heart, Repeat2, UserPlus, MessageCircle, Quote, AtSign } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import { useKeyboardStore } from '../../stores/keyboardStore';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { shortTimeAgo } from '../../utils/helpers';
import Avatar from '../common/Avatar';
import Loading from '../common/Loading';
import PostViewer from '../posts/PostViewer';
import SlideOutComposer from '../posts/SlideOutComposer';

const notificationIcons = {
  like: Heart,
  repost: Repeat2,
  follow: UserPlus,
  mention: AtSign,
  reply: MessageCircle,
  quote: Quote,
};

const notificationColors = {
  like: 'text-red-500',
  repost: 'text-green-500',
  follow: 'text-primary',
  mention: 'text-primary',
  reply: 'text-primary',
  quote: 'text-primary',
};

const notificationLabels = {
  like: 'liked your post',
  repost: 'reposted your post',
  follow: 'followed you',
  mention: 'mentioned you',
  reply: 'replied to your post',
  quote: 'quoted your post',
};

function NotificationColumn({ column }) {
  const {
    notifications,
    isLoading,
    error,
    cursor,
    seenAt,
    fetchNotifications,
    loadMore,
    markAllAsSeen,
  } = useNotificationStore();

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
  useAutoRefresh(fetchNotifications, column.refreshInterval ?? 60, true);

  useEffect(() => {
    if (notifications.length === 0) {
      fetchNotifications();
    }
  }, [notifications.length, fetchNotifications]);

  // Mark as seen when viewing
  useEffect(() => {
    if (notifications.length > 0) {
      markAllAsSeen();
    }
  }, [notifications.length, markAllAsSeen]);

  // Infinite scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoading || !cursor) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      loadMore();
    }
  }, [isLoading, cursor, loadMore]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const isUnread = (notification) => {
    if (!seenAt) return true;
    return new Date(notification.indexedAt) > new Date(seenAt);
  };

  // Get the post to view based on notification type
  const getPostForNotification = (notification) => {
    // For like/repost, show the subject post (your post that was liked/reposted)
    if (notification.reason === 'like' || notification.reason === 'repost') {
      if (notification.subjectPost) {
        return notification.subjectPost;
      }
      // Fallback: construct a minimal post object from the subject URI
      if (notification.reasonSubject) {
        return { uri: notification.reasonSubject };
      }
    }
    // For reply/quote/mention, show the notification post itself (their reply/quote)
    if (notification.reason === 'reply' || notification.reason === 'quote' || notification.reason === 'mention') {
      return {
        uri: notification.uri,
        cid: notification.cid,
        author: notification.author,
        record: notification.record,
        indexedAt: notification.indexedAt,
      };
    }
    return null;
  };

  const handleNotificationClick = (notification) => {
    // For follows, we could open a profile - but for now just skip
    if (notification.reason === 'follow') {
      return;
    }

    const post = getPostForNotification(notification);
    if (post) {
      setSelectedPost(post);
      setShowPostViewer(true);
    }
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
      {isLoading && notifications.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <Loading size="lg" />
        </div>
      )}

      {/* Notifications list */}
      {notifications.map((notification, index) => {
        const Icon = notificationIcons[notification.reason] || Heart;
        const colorClass = notificationColors[notification.reason] || 'text-primary';
        const label = notificationLabels[notification.reason] || notification.reason;
        const author = notification.author;
        const isClickable = notification.reason !== 'follow';

        return (
          <div
            key={notification.uri || index}
            onClick={() => handleNotificationClick(notification)}
            className={`px-4 py-3 border-b border-border flex gap-3 transition-colors ${
              isUnread(notification) ? 'bg-primary/5' : ''
            } ${isClickable ? 'cursor-pointer hover:bg-bg-tertiary/50' : ''}`}
          >
            <div className="w-10 flex justify-center">
              <Icon className={`w-5 h-5 ${colorClass}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {author?.avatar && (
                  <Avatar src={author.avatar} alt="" size="sm" />
                )}
                <span className="font-medium text-text-primary truncate">
                  {author?.displayName || author?.handle}
                </span>
                <span className="text-text-muted text-sm">
                  {shortTimeAgo(notification.indexedAt)}
                </span>
              </div>

              <p className="text-text-secondary text-sm mt-1">
                {label}
              </p>

              {/* Show subject post preview for likes and reposts */}
              {(notification.reason === 'like' || notification.reason === 'repost') && notification.subjectPost?.text && (
                <p className="text-text-muted text-sm mt-2 line-clamp-2 border-l-2 border-border pl-2">
                  {notification.subjectPost.text}
                </p>
              )}

              {/* Show reply/quote/mention text */}
              {(notification.reason === 'reply' || notification.reason === 'quote' || notification.reason === 'mention') && notification.record?.text && (
                <p className="text-text-muted text-sm mt-2 line-clamp-2">
                  {notification.record.text}
                </p>
              )}

              {/* Click hint for interactive notifications */}
              {isClickable && (
                <p className="text-xs text-text-muted mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to view thread
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Load more indicator */}
      {isLoading && notifications.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <Loading size="md" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && notifications.length === 0 && (
        <div className="flex items-center justify-center py-8 text-text-muted">
          <p>No notifications yet</p>
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

export default NotificationColumn;

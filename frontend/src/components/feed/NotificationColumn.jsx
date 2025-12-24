import { useEffect, useCallback, useRef } from 'react';
import { Heart, Repeat2, UserPlus, MessageCircle, Quote, AtSign } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { shortTimeAgo } from '../../utils/helpers';
import Avatar from '../common/Avatar';
import Loading from '../common/Loading';

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

  return (
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

        return (
          <div
            key={notification.uri || index}
            className={`px-4 py-3 border-b border-border flex gap-3 hover:bg-bg-tertiary/50 transition-colors ${
              isUnread(notification) ? 'bg-primary/5' : ''
            }`}
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

              {/* Show post preview for likes, reposts, quotes */}
              {notification.record?.text && (
                <p className="text-text-muted text-sm mt-2 line-clamp-2">
                  {notification.record.text}
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
  );
}

export default NotificationColumn;

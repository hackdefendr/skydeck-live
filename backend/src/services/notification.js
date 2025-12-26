import { blueskyService } from './bluesky.js';
import { authService } from './auth.js';
import { emitNotification } from '../socket/index.js';

class NotificationService {
  // Get notifications
  async getNotifications(user, { limit = 50, cursor } = {}) {
    const agent = await authService.getBlueskyAgent(user);
    const result = await blueskyService.getNotifications(agent, { limit, cursor });

    // Fetch subject posts for likes and reposts
    const subjectUris = result.notifications
      .filter(n => (n.reason === 'like' || n.reason === 'repost') && n.reasonSubject)
      .map(n => n.reasonSubject);

    let subjectPosts = {};
    if (subjectUris.length > 0) {
      try {
        // Fetch posts in batches of 25 (API limit)
        const uniqueUris = [...new Set(subjectUris)];
        const batches = [];
        for (let i = 0; i < uniqueUris.length; i += 25) {
          batches.push(uniqueUris.slice(i, i + 25));
        }

        const batchResults = await Promise.all(
          batches.map(batch => blueskyService.getPosts(agent, batch).catch(() => []))
        );

        for (const posts of batchResults) {
          for (const post of posts) {
            subjectPosts[post.uri] = {
              uri: post.uri,
              cid: post.cid,
              text: post.record?.text || '',
              author: post.author ? {
                did: post.author.did,
                handle: post.author.handle,
                displayName: post.author.displayName,
              } : null,
            };
          }
        }
      } catch (error) {
        console.error('Failed to fetch subject posts:', error);
      }
    }

    return {
      notifications: this.transformNotifications(result.notifications, subjectPosts),
      cursor: result.cursor,
      seenAt: result.seenAt,
    };
  }

  // Get unread count
  async getUnreadCount(user) {
    const agent = await authService.getBlueskyAgent(user);
    const result = await blueskyService.getNotifications(agent, { limit: 100 });

    if (!result.seenAt) {
      return result.notifications.length;
    }

    const seenAt = new Date(result.seenAt);
    return result.notifications.filter(
      (n) => new Date(n.indexedAt) > seenAt
    ).length;
  }

  // Mark notifications as seen
  async markAsSeen(user) {
    const agent = await authService.getBlueskyAgent(user);
    return blueskyService.updateSeenNotifications(agent);
  }

  // Transform notifications for frontend
  transformNotifications(notifications, subjectPosts = {}) {
    return notifications.map((notification) => ({
      uri: notification.uri,
      cid: notification.cid,
      reason: notification.reason,
      reasonSubject: notification.reasonSubject,
      isRead: notification.isRead,
      indexedAt: notification.indexedAt,
      author: notification.author ? {
        did: notification.author.did,
        handle: notification.author.handle,
        displayName: notification.author.displayName,
        avatar: notification.author.avatar,
      } : null,
      record: notification.record,
      labels: notification.labels || [],
      // Include subject post data for likes/reposts
      subjectPost: notification.reasonSubject ? subjectPosts[notification.reasonSubject] : null,
    }));
  }

  // Group notifications by type
  groupNotifications(notifications) {
    const groups = {
      likes: [],
      reposts: [],
      follows: [],
      mentions: [],
      replies: [],
      quotes: [],
      other: [],
    };

    for (const notification of notifications) {
      switch (notification.reason) {
        case 'like':
          groups.likes.push(notification);
          break;
        case 'repost':
          groups.reposts.push(notification);
          break;
        case 'follow':
          groups.follows.push(notification);
          break;
        case 'mention':
          groups.mentions.push(notification);
          break;
        case 'reply':
          groups.replies.push(notification);
          break;
        case 'quote':
          groups.quotes.push(notification);
          break;
        default:
          groups.other.push(notification);
      }
    }

    return groups;
  }

  // Send real-time notification to user
  sendRealtimeNotification(userId, notification) {
    emitNotification(userId, this.transformNotifications([notification])[0]);
  }

  // Get notification summary
  getNotificationSummary(notifications) {
    const groups = this.groupNotifications(notifications);

    return {
      total: notifications.length,
      likes: groups.likes.length,
      reposts: groups.reposts.length,
      follows: groups.follows.length,
      mentions: groups.mentions.length,
      replies: groups.replies.length,
      quotes: groups.quotes.length,
    };
  }
}

export const notificationService = new NotificationService();
export default notificationService;

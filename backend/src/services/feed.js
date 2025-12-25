import { blueskyService } from './bluesky.js';
import { authService } from './auth.js';
import { cache, cacheKeys } from '../utils/cache.js';

class FeedService {
  // Get timeline (home feed)
  async getTimeline(user, { limit = 50, cursor } = {}) {
    const agent = await authService.getBlueskyAgent(user);
    return blueskyService.getTimeline(agent, { limit, cursor });
  }

  // Get author feed (user's posts)
  async getAuthorFeed(user, actor, { limit = 50, cursor, filter } = {}) {
    const agent = await authService.getBlueskyAgent(user);
    return blueskyService.getAuthorFeed(agent, actor, { limit, cursor, filter });
  }

  // Get custom feed (generator feed)
  async getFeed(user, feedUri, { limit = 50, cursor } = {}) {
    const agent = await authService.getBlueskyAgent(user);
    return blueskyService.getFeed(agent, feedUri, { limit, cursor });
  }

  // Get list feed
  async getListFeed(user, listUri, { limit = 50, cursor } = {}) {
    const agent = await authService.getBlueskyAgent(user);
    return blueskyService.getListFeed(agent, listUri, { limit, cursor });
  }

  // Get actor likes
  async getActorLikes(user, actor, { limit = 50, cursor } = {}) {
    const agent = await authService.getBlueskyAgent(user);
    return blueskyService.getActorLikes(agent, actor, { limit, cursor });
  }

  // Get suggested feeds
  async getSuggestedFeeds(user, { limit = 50, cursor } = {}) {
    const agent = await authService.getBlueskyAgent(user);
    return blueskyService.getSuggestedFeeds(agent, { limit, cursor });
  }

  // Get saved feeds
  async getSavedFeeds(user) {
    const agent = await authService.getBlueskyAgent(user);
    return blueskyService.getSavedFeeds(agent);
  }

  // Get saved feeds with full info
  async getSavedFeedsWithInfo(user) {
    const agent = await authService.getBlueskyAgent(user);
    return blueskyService.getSavedFeedsWithInfo(agent);
  }

  // Get feed generators info
  async getFeedGenerators(user, feedUris) {
    const agent = await authService.getBlueskyAgent(user);
    return blueskyService.getFeedGenerators(agent, feedUris);
  }

  // Get post thread
  async getPostThread(user, uri, { depth = 10, parentHeight = 80 } = {}) {
    const agent = await authService.getBlueskyAgent(user);
    return blueskyService.getPostThread(agent, uri, { depth, parentHeight });
  }

  // Get mentions (notifications filtered to mentions)
  async getMentions(user, { limit = 50, cursor } = {}) {
    const agent = await authService.getBlueskyAgent(user);
    const { notifications, cursor: nextCursor } = await blueskyService.getNotifications(agent, { limit: limit * 2, cursor });

    // Filter to only mentions
    const mentions = notifications.filter(
      (n) => n.reason === 'mention' || n.reason === 'reply'
    ).slice(0, limit);

    return {
      notifications: mentions,
      cursor: nextCursor,
    };
  }

  // Transform feed items for frontend
  transformFeedItems(feed) {
    return feed.map((item) => ({
      post: this.transformPost(item.post),
      reply: item.reply ? {
        root: this.transformPost(item.reply.root),
        parent: this.transformPost(item.reply.parent),
      } : undefined,
      reason: item.reason,
    }));
  }

  // Transform single post
  transformPost(post) {
    if (!post) return null;

    return {
      uri: post.uri,
      cid: post.cid,
      author: {
        did: post.author.did,
        handle: post.author.handle,
        displayName: post.author.displayName,
        avatar: post.author.avatar,
      },
      record: {
        text: post.record?.text,
        createdAt: post.record?.createdAt,
        facets: post.record?.facets,
        embed: post.record?.embed,
        reply: post.record?.reply,
        langs: post.record?.langs,
      },
      embed: post.embed,
      replyCount: post.replyCount || 0,
      repostCount: post.repostCount || 0,
      likeCount: post.likeCount || 0,
      quoteCount: post.quoteCount || 0,
      indexedAt: post.indexedAt,
      viewer: {
        like: post.viewer?.like,
        repost: post.viewer?.repost,
        muted: post.viewer?.muted,
        blockedBy: post.viewer?.blockedBy,
        blocking: post.viewer?.blocking,
      },
      labels: post.labels || [],
    };
  }

  // Get feed for column type
  async getFeedForColumn(user, column) {
    switch (column.type) {
      case 'HOME':
        return this.getTimeline(user);

      case 'NOTIFICATIONS':
        return { notifications: (await this.getNotifications(user)).notifications };

      case 'MENTIONS':
        return this.getMentions(user);

      case 'FEED':
        if (column.feedUri) {
          return this.getFeed(user, column.feedUri);
        }
        return { feed: [] };

      case 'LIST':
        if (column.listUri) {
          return this.getListFeed(user, column.listUri);
        }
        return { feed: [] };

      case 'PROFILE':
        if (column.profileDid) {
          return this.getAuthorFeed(user, column.profileDid);
        }
        return { feed: [] };

      case 'LIKES':
        return this.getActorLikes(user, user.did);

      case 'SEARCH':
        if (column.searchQuery) {
          return this.searchPosts(user, column.searchQuery);
        }
        return { posts: [] };

      case 'HASHTAG':
        if (column.hashtag) {
          return this.searchByHashtag(user, column.hashtag);
        }
        return { posts: [] };

      default:
        return { feed: [] };
    }
  }

  // Search posts
  async searchPosts(user, query, { limit = 25, cursor } = {}) {
    const agent = await authService.getBlueskyAgent(user);
    return blueskyService.searchPosts(agent, query, { limit, cursor });
  }

  // Search posts by hashtag
  async searchByHashtag(user, hashtag, { limit = 50, cursor } = {}) {
    const agent = await authService.getBlueskyAgent(user);
    // Ensure hashtag starts with # for search
    const searchTag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
    return blueskyService.searchPosts(agent, searchTag, { limit, cursor });
  }

  // Get notifications
  async getNotifications(user, { limit = 50, cursor } = {}) {
    const agent = await authService.getBlueskyAgent(user);
    return blueskyService.getNotifications(agent, { limit, cursor });
  }

  // Mark notifications as seen
  async markNotificationsSeen(user) {
    const agent = await authService.getBlueskyAgent(user);
    return blueskyService.updateSeenNotifications(agent);
  }

  // Get posts by URIs (for bookmarks, etc.)
  async getPostsByUris(user, uris) {
    if (!uris || uris.length === 0) return [];
    const agent = await authService.getBlueskyAgent(user);
    return blueskyService.getPosts(agent, uris);
  }
}

export const feedService = new FeedService();
export default feedService;

import { BskyAgent, RichText } from '@atproto/api';
import config from '../config/index.js';
import { cache, cacheKeys } from '../utils/cache.js';
import { withRateLimit, rateLimiter } from '../utils/rateLimiter.js';

class BlueskyService {
  constructor() {
    this.agents = new Map();
  }

  // Create a new BskyAgent
  _createAgent() {
    return new BskyAgent({
      service: config.bluesky.service,
    });
  }

  // Get or create an agent for a user
  async getAgent(accessJwt, refreshJwt, did = '', handle = '') {
    const agent = this._createAgent();

    if (accessJwt) {
      await agent.resumeSession({
        accessJwt,
        refreshJwt,
        did,
        handle,
        active: true,
      });
    }

    return agent;
  }

  // Create authenticated agent from tokens
  async createAuthenticatedAgent(accessJwt, refreshJwt, did, handle) {
    const agent = this._createAgent();

    await agent.resumeSession({
      accessJwt,
      refreshJwt,
      did,
      handle,
      active: true,
    });

    return agent;
  }

  // Login with identifier and password (with rate limiting and exponential backoff)
  async login(identifier, password) {
    const agent = this._createAgent();

    try {
      const response = await withRateLimit.auth(
        () => agent.login({ identifier, password }),
        {
          maxRetries: 3,
          baseDelay: 5000, // Start with 5 second delay for auth
          maxDelay: 120000, // Max 2 minutes between retries
          onRetry: (attempt, delay, error) => {
            console.log(`Login retry ${attempt + 1}: waiting ${delay}ms after error: ${error.message}`);
          },
        }
      );

      return {
        success: true,
        did: response.data.did,
        handle: response.data.handle,
        accessJwt: response.data.accessJwt,
        refreshJwt: response.data.refreshJwt,
        email: response.data.email,
        displayName: response.data.displayName,
      };
    } catch (error) {
      console.error('Bluesky login error:', error.message);

      // Provide more helpful error messages
      let errorMessage = error.message || 'Login failed';
      if (error.message?.includes('RateLimitExceeded') || error.status === 429) {
        errorMessage = 'Too many login attempts. Please wait a few minutes and try again.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Refresh session using the refreshJwt (with rate limiting)
  async refreshSession(refreshJwt) {
    try {
      // Use the AT Protocol refresh endpoint directly
      // The BskyAgent.refreshSession() method requires an authenticated agent,
      // so we need to call the endpoint directly with the refresh token
      const response = await withRateLimit.auth(
        async () => {
          const res = await fetch(`${config.bluesky.service}/xrpc/com.atproto.server.refreshSession`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${refreshJwt}`,
              'Content-Type': 'application/json',
            },
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            const error = new Error(errorData.message || `Refresh failed: ${res.status}`);
            error.status = res.status;
            throw error;
          }

          return res.json();
        },
        { maxRetries: 2, baseDelay: 3000 }
      );

      return {
        success: true,
        accessJwt: response.accessJwt,
        refreshJwt: response.refreshJwt,
        did: response.did,
        handle: response.handle,
      };
    } catch (error) {
      console.error('Session refresh error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get profile (with rate limiting and caching)
  async getProfile(agent, actor) {
    const cacheKey = cacheKeys.userProfile(actor);
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await withRateLimit.read(
        () => agent.getProfile({ actor })
      );
      const profile = response.data;
      await cache.set(cacheKey, profile, 300); // Cache for 5 minutes
      return profile;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update profile (with rate limiting)
  async updateProfile(agent, updates) {
    try {
      await withRateLimit.write(
        () => agent.upsertProfile((existing) => ({
          ...existing,
          displayName: updates.displayName ?? existing?.displayName,
          description: updates.description ?? existing?.description,
          avatar: updates.avatar ?? existing?.avatar,
          banner: updates.banner ?? existing?.banner,
        }))
      );
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get timeline (home feed) with rate limiting
  async getTimeline(agent, { limit = 50, cursor } = {}) {
    try {
      const response = await withRateLimit.read(
        () => agent.getTimeline({ limit, cursor })
      );
      return {
        feed: response.data.feed,
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Get timeline error:', error);
      throw error;
    }
  }

  // Get author feed (with rate limiting)
  async getAuthorFeed(agent, actor, { limit = 50, cursor, filter = 'posts_and_author_threads' } = {}) {
    try {
      const response = await withRateLimit.read(
        () => agent.getAuthorFeed({ actor, limit, cursor, filter })
      );
      return {
        feed: response.data.feed,
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Get author feed error:', error);
      throw error;
    }
  }

  // Get custom feed (with rate limiting)
  async getFeed(agent, feed, { limit = 50, cursor } = {}) {
    try {
      const response = await withRateLimit.read(
        () => agent.app.bsky.feed.getFeed({ feed, limit, cursor })
      );
      return {
        feed: response.data.feed,
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Get feed error:', error);
      throw error;
    }
  }

  // Get post thread (with rate limiting)
  async getPostThread(agent, uri, { depth = 10, parentHeight = 80 } = {}) {
    try {
      const response = await withRateLimit.read(
        () => agent.getPostThread({ uri, depth, parentHeight })
      );
      return response.data.thread;
    } catch (error) {
      console.error('Get post thread error:', error);
      throw error;
    }
  }

  // Create post (with rate limiting)
  async createPost(agent, { text, replyTo, embed, langs }) {
    try {
      const rt = new RichText({ text });
      await rt.detectFacets(agent);

      const postRecord = {
        text: rt.text,
        facets: rt.facets,
        createdAt: new Date().toISOString(),
      };

      if (langs) {
        postRecord.langs = langs;
      }

      if (replyTo) {
        postRecord.reply = replyTo;
      }

      if (embed) {
        postRecord.embed = embed;
      }

      const response = await withRateLimit.write(
        () => agent.post(postRecord)
      );
      return {
        success: true,
        uri: response.uri,
        cid: response.cid,
      };
    } catch (error) {
      console.error('Create post error:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete post (with rate limiting)
  async deletePost(agent, uri) {
    try {
      await withRateLimit.write(() => agent.deletePost(uri));
      return { success: true };
    } catch (error) {
      console.error('Delete post error:', error);
      return { success: false, error: error.message };
    }
  }

  // Like post (with rate limiting)
  async likePost(agent, uri, cid) {
    try {
      const response = await withRateLimit.write(
        () => agent.like(uri, cid)
      );
      return { success: true, uri: response.uri };
    } catch (error) {
      console.error('Like post error:', error);
      return { success: false, error: error.message };
    }
  }

  // Unlike post (with rate limiting)
  async unlikePost(agent, likeUri) {
    try {
      await withRateLimit.write(() => agent.deleteLike(likeUri));
      return { success: true };
    } catch (error) {
      console.error('Unlike post error:', error);
      return { success: false, error: error.message };
    }
  }

  // Repost (with rate limiting)
  async repost(agent, uri, cid) {
    try {
      const response = await withRateLimit.write(
        () => agent.repost(uri, cid)
      );
      return { success: true, uri: response.uri };
    } catch (error) {
      console.error('Repost error:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete repost (with rate limiting)
  async deleteRepost(agent, repostUri) {
    try {
      await withRateLimit.write(() => agent.deleteRepost(repostUri));
      return { success: true };
    } catch (error) {
      console.error('Delete repost error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get notifications (with rate limiting)
  async getNotifications(agent, { limit = 50, cursor } = {}) {
    try {
      const response = await withRateLimit.read(
        () => agent.listNotifications({ limit, cursor })
      );
      return {
        notifications: response.data.notifications,
        cursor: response.data.cursor,
        seenAt: response.data.seenAt,
      };
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  }

  // Update seen notifications (with rate limiting)
  async updateSeenNotifications(agent) {
    try {
      await withRateLimit.write(() => agent.updateSeenNotifications());
      return { success: true };
    } catch (error) {
      console.error('Update seen notifications error:', error);
      return { success: false, error: error.message };
    }
  }

  // Follow user (with rate limiting)
  async follow(agent, did) {
    try {
      const response = await withRateLimit.write(
        () => agent.follow(did)
      );
      return { success: true, uri: response.uri };
    } catch (error) {
      console.error('Follow error:', error);
      return { success: false, error: error.message };
    }
  }

  // Unfollow user (with rate limiting)
  async unfollow(agent, followUri) {
    try {
      await withRateLimit.write(() => agent.deleteFollow(followUri));
      return { success: true };
    } catch (error) {
      console.error('Unfollow error:', error);
      return { success: false, error: error.message };
    }
  }

  // Block user (with rate limiting)
  async block(agent, did) {
    try {
      const response = await withRateLimit.write(
        () => agent.app.bsky.graph.block.create(
          { repo: agent.session.did },
          { subject: did, createdAt: new Date().toISOString() }
        )
      );
      return { success: true, uri: response.uri };
    } catch (error) {
      console.error('Block error:', error);
      return { success: false, error: error.message };
    }
  }

  // Unblock user (with rate limiting)
  async unblock(agent, blockUri) {
    try {
      const { rkey } = this.parseAtUri(blockUri);
      await withRateLimit.write(
        () => agent.app.bsky.graph.block.delete({
          repo: agent.session.did,
          rkey,
        })
      );
      return { success: true };
    } catch (error) {
      console.error('Unblock error:', error);
      return { success: false, error: error.message };
    }
  }

  // Mute user (with rate limiting)
  async mute(agent, did) {
    try {
      await withRateLimit.write(() => agent.mute(did));
      return { success: true };
    } catch (error) {
      console.error('Mute error:', error);
      return { success: false, error: error.message };
    }
  }

  // Unmute user (with rate limiting)
  async unmute(agent, did) {
    try {
      await withRateLimit.write(() => agent.unmute(did));
      return { success: true };
    } catch (error) {
      console.error('Unmute error:', error);
      return { success: false, error: error.message };
    }
  }

  // Search posts (with rate limiting)
  async searchPosts(agent, query, { limit = 25, cursor } = {}) {
    try {
      const response = await withRateLimit.read(
        () => agent.app.bsky.feed.searchPosts({ q: query, limit, cursor })
      );
      return {
        posts: response.data.posts,
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Search posts error:', error);
      throw error;
    }
  }

  // Search actors (with rate limiting)
  async searchActors(agent, query, { limit = 25, cursor } = {}) {
    try {
      const response = await withRateLimit.read(
        () => agent.searchActors({ term: query, limit, cursor })
      );
      return {
        actors: response.data.actors,
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Search actors error:', error);
      throw error;
    }
  }

  // Get followers (with rate limiting)
  async getFollowers(agent, actor, { limit = 50, cursor } = {}) {
    try {
      const response = await withRateLimit.read(
        () => agent.getFollowers({ actor, limit, cursor })
      );
      return {
        followers: response.data.followers,
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Get followers error:', error);
      throw error;
    }
  }

  // Get follows (with rate limiting)
  async getFollows(agent, actor, { limit = 50, cursor } = {}) {
    try {
      const response = await withRateLimit.read(
        () => agent.getFollows({ actor, limit, cursor })
      );
      return {
        follows: response.data.follows,
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Get follows error:', error);
      throw error;
    }
  }

  // Get lists (with rate limiting)
  async getLists(agent, actor, { limit = 50, cursor } = {}) {
    try {
      const response = await withRateLimit.read(
        () => agent.app.bsky.graph.getLists({ actor, limit, cursor })
      );
      return {
        lists: response.data.lists,
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Get lists error:', error);
      throw error;
    }
  }

  // Get list feed (with rate limiting)
  async getListFeed(agent, list, { limit = 50, cursor } = {}) {
    try {
      const response = await withRateLimit.read(
        () => agent.app.bsky.feed.getListFeed({ list, limit, cursor })
      );
      return {
        feed: response.data.feed,
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Get list feed error:', error);
      throw error;
    }
  }

  // Upload blob (for images/media) - with rate limiting
  async uploadBlob(agent, data, mimeType) {
    try {
      const response = await withRateLimit.write(
        () => agent.uploadBlob(data, { encoding: mimeType }),
        { maxRetries: 2, baseDelay: 2000 }
      );
      return {
        success: true,
        blob: response.data.blob,
      };
    } catch (error) {
      console.error('Upload blob error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get actor likes (with rate limiting)
  async getActorLikes(agent, actor, { limit = 50, cursor } = {}) {
    try {
      const response = await withRateLimit.read(
        () => agent.app.bsky.feed.getActorLikes({ actor, limit, cursor })
      );
      return {
        feed: response.data.feed,
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Get actor likes error:', error);
      throw error;
    }
  }

  // Get suggested feeds (with rate limiting and caching)
  async getSuggestedFeeds(agent, { limit = 50, cursor } = {}) {
    // Cache suggested feeds as they don't change frequently
    const cacheKey = `suggested_feeds_${limit}_${cursor || 'initial'}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await withRateLimit.read(
        () => agent.app.bsky.feed.getSuggestedFeeds({ limit, cursor })
      );
      const result = {
        feeds: response.data.feeds,
        cursor: response.data.cursor,
      };
      await cache.set(cacheKey, result, 600); // Cache for 10 minutes
      return result;
    } catch (error) {
      console.error('Get suggested feeds error:', error);
      throw error;
    }
  }

  // Get saved feeds (with rate limiting and caching)
  async getSavedFeeds(agent) {
    try {
      const response = await withRateLimit.read(
        () => agent.app.bsky.actor.getPreferences()
      );
      const savedFeedsPref = response.data.preferences.find(
        (p) => p.$type === 'app.bsky.actor.defs#savedFeedsPref'
      );
      return savedFeedsPref?.saved || [];
    } catch (error) {
      console.error('Get saved feeds error:', error);
      throw error;
    }
  }

  // Get all preferences (with rate limiting)
  async getPreferences(agent) {
    try {
      const response = await withRateLimit.read(
        () => agent.app.bsky.actor.getPreferences()
      );
      return response.data.preferences;
    } catch (error) {
      console.error('Get preferences error:', error);
      throw error;
    }
  }

  // Get content label preferences
  async getContentLabelPrefs(agent) {
    try {
      const preferences = await this.getPreferences(agent);
      const labelPrefs = preferences.filter(
        (p) => p.$type === 'app.bsky.actor.defs#contentLabelPref'
      );
      return labelPrefs;
    } catch (error) {
      console.error('Get content label prefs error:', error);
      throw error;
    }
  }

  // Set content label preference (with rate limiting)
  async setContentLabelPref(agent, { labelerDid, label, visibility }) {
    try {
      // Get current preferences
      const currentPrefs = await this.getPreferences(agent);

      // Filter out the existing pref for this label (if any)
      const otherPrefs = currentPrefs.filter(
        (p) => !(p.$type === 'app.bsky.actor.defs#contentLabelPref' &&
                 p.label === label &&
                 (p.labelerDid || null) === (labelerDid || null))
      );

      // Add the new preference
      const newPref = {
        $type: 'app.bsky.actor.defs#contentLabelPref',
        label,
        visibility, // 'ignore' | 'warn' | 'hide'
      };
      if (labelerDid) {
        newPref.labelerDid = labelerDid;
      }

      const updatedPrefs = [...otherPrefs, newPref];

      await withRateLimit.write(
        () => agent.app.bsky.actor.putPreferences({ preferences: updatedPrefs })
      );

      return { success: true };
    } catch (error) {
      console.error('Set content label pref error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get adult content enabled preference
  async getAdultContentEnabled(agent) {
    try {
      const preferences = await this.getPreferences(agent);
      const adultPref = preferences.find(
        (p) => p.$type === 'app.bsky.actor.defs#adultContentPref'
      );
      return adultPref?.enabled ?? false;
    } catch (error) {
      console.error('Get adult content pref error:', error);
      throw error;
    }
  }

  // Set adult content enabled (with rate limiting)
  async setAdultContentEnabled(agent, enabled) {
    try {
      const currentPrefs = await this.getPreferences(agent);

      // Filter out existing adult content pref
      const otherPrefs = currentPrefs.filter(
        (p) => p.$type !== 'app.bsky.actor.defs#adultContentPref'
      );

      const updatedPrefs = [
        ...otherPrefs,
        {
          $type: 'app.bsky.actor.defs#adultContentPref',
          enabled,
        },
      ];

      await withRateLimit.write(
        () => agent.app.bsky.actor.putPreferences({ preferences: updatedPrefs })
      );

      return { success: true };
    } catch (error) {
      console.error('Set adult content pref error:', error);
      return { success: false, error: error.message };
    }
  }

  // Report content (with rate limiting)
  async reportContent(agent, { reasonType, reason, subject }) {
    try {
      await withRateLimit.write(
        () => agent.app.bsky.moderation.createReport({
          reasonType,
          reason,
          subject,
        })
      );
      return { success: true };
    } catch (error) {
      console.error('Report content error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get rate limit status for monitoring
  getRateLimitStatus() {
    return rateLimiter.getAllStatus();
  }

  // Parse AT URI helper
  parseAtUri(uri) {
    const match = uri.match(/^at:\/\/([^/]+)\/([^/]+)\/(.+)$/);
    if (!match) return null;
    return {
      repo: match[1],
      collection: match[2],
      rkey: match[3],
    };
  }
}

export const blueskyService = new BlueskyService();
export default blueskyService;

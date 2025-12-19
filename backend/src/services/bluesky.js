import { BskyAgent, RichText } from '@atproto/api';
import config from '../config/index.js';
import { cache, cacheKeys } from '../utils/cache.js';

class BlueskyService {
  constructor() {
    this.agents = new Map();
  }

  // Create a custom fetch function that includes the API key header
  _createFetchHandler() {
    const apiKey = config.bluesky.apikey;
    if (!apiKey) {
      return undefined; // Use default fetch if no API key
    }

    return async (url, options = {}) => {
      const headers = new Headers(options.headers);
      headers.set('Authorization', `Bearer ${apiKey}`);

      return fetch(url, {
        ...options,
        headers,
      });
    };
  }

  // Create a new BskyAgent with optional API key support
  _createAgent() {
    const fetchHandler = this._createFetchHandler();
    return new BskyAgent({
      service: config.bluesky.service,
      ...(fetchHandler && { fetch: fetchHandler }),
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

  // Login with identifier and password
  async login(identifier, password) {
    const agent = this._createAgent();

    try {
      const response = await agent.login({ identifier, password });
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
      console.error('Bluesky login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  }

  // Refresh session
  async refreshSession(refreshJwt) {
    const agent = this._createAgent();

    try {
      const response = await agent.resumeSession({
        refreshJwt,
        accessJwt: '',
        did: '',
        handle: '',
      });
      return {
        success: true,
        accessJwt: response.data.accessJwt,
        refreshJwt: response.data.refreshJwt,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get profile
  async getProfile(agent, actor) {
    const cacheKey = cacheKeys.userProfile(actor);
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await agent.getProfile({ actor });
      const profile = response.data;
      await cache.set(cacheKey, profile, 60);
      return profile;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update profile
  async updateProfile(agent, updates) {
    try {
      await agent.upsertProfile((existing) => ({
        ...existing,
        displayName: updates.displayName ?? existing?.displayName,
        description: updates.description ?? existing?.description,
        avatar: updates.avatar ?? existing?.avatar,
        banner: updates.banner ?? existing?.banner,
      }));
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get timeline (home feed)
  async getTimeline(agent, { limit = 50, cursor } = {}) {
    try {
      const response = await agent.getTimeline({ limit, cursor });
      return {
        feed: response.data.feed,
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Get timeline error:', error);
      throw error;
    }
  }

  // Get author feed
  async getAuthorFeed(agent, actor, { limit = 50, cursor, filter = 'posts_and_author_threads' } = {}) {
    try {
      const response = await agent.getAuthorFeed({ actor, limit, cursor, filter });
      return {
        feed: response.data.feed,
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Get author feed error:', error);
      throw error;
    }
  }

  // Get custom feed
  async getFeed(agent, feed, { limit = 50, cursor } = {}) {
    try {
      const response = await agent.app.bsky.feed.getFeed({ feed, limit, cursor });
      return {
        feed: response.data.feed,
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Get feed error:', error);
      throw error;
    }
  }

  // Get post thread
  async getPostThread(agent, uri, { depth = 10, parentHeight = 80 } = {}) {
    try {
      const response = await agent.getPostThread({ uri, depth, parentHeight });
      return response.data.thread;
    } catch (error) {
      console.error('Get post thread error:', error);
      throw error;
    }
  }

  // Create post
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

      const response = await agent.post(postRecord);
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

  // Delete post
  async deletePost(agent, uri) {
    try {
      await agent.deletePost(uri);
      return { success: true };
    } catch (error) {
      console.error('Delete post error:', error);
      return { success: false, error: error.message };
    }
  }

  // Like post
  async likePost(agent, uri, cid) {
    try {
      const response = await agent.like(uri, cid);
      return { success: true, uri: response.uri };
    } catch (error) {
      console.error('Like post error:', error);
      return { success: false, error: error.message };
    }
  }

  // Unlike post
  async unlikePost(agent, likeUri) {
    try {
      await agent.deleteLike(likeUri);
      return { success: true };
    } catch (error) {
      console.error('Unlike post error:', error);
      return { success: false, error: error.message };
    }
  }

  // Repost
  async repost(agent, uri, cid) {
    try {
      const response = await agent.repost(uri, cid);
      return { success: true, uri: response.uri };
    } catch (error) {
      console.error('Repost error:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete repost
  async deleteRepost(agent, repostUri) {
    try {
      await agent.deleteRepost(repostUri);
      return { success: true };
    } catch (error) {
      console.error('Delete repost error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get notifications
  async getNotifications(agent, { limit = 50, cursor } = {}) {
    try {
      const response = await agent.listNotifications({ limit, cursor });
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

  // Update seen notifications
  async updateSeenNotifications(agent) {
    try {
      await agent.updateSeenNotifications();
      return { success: true };
    } catch (error) {
      console.error('Update seen notifications error:', error);
      return { success: false, error: error.message };
    }
  }

  // Follow user
  async follow(agent, did) {
    try {
      const response = await agent.follow(did);
      return { success: true, uri: response.uri };
    } catch (error) {
      console.error('Follow error:', error);
      return { success: false, error: error.message };
    }
  }

  // Unfollow user
  async unfollow(agent, followUri) {
    try {
      await agent.deleteFollow(followUri);
      return { success: true };
    } catch (error) {
      console.error('Unfollow error:', error);
      return { success: false, error: error.message };
    }
  }

  // Block user
  async block(agent, did) {
    try {
      const response = await agent.app.bsky.graph.block.create(
        { repo: agent.session.did },
        { subject: did, createdAt: new Date().toISOString() }
      );
      return { success: true, uri: response.uri };
    } catch (error) {
      console.error('Block error:', error);
      return { success: false, error: error.message };
    }
  }

  // Unblock user
  async unblock(agent, blockUri) {
    try {
      const { rkey } = this.parseAtUri(blockUri);
      await agent.app.bsky.graph.block.delete({
        repo: agent.session.did,
        rkey,
      });
      return { success: true };
    } catch (error) {
      console.error('Unblock error:', error);
      return { success: false, error: error.message };
    }
  }

  // Mute user
  async mute(agent, did) {
    try {
      await agent.mute(did);
      return { success: true };
    } catch (error) {
      console.error('Mute error:', error);
      return { success: false, error: error.message };
    }
  }

  // Unmute user
  async unmute(agent, did) {
    try {
      await agent.unmute(did);
      return { success: true };
    } catch (error) {
      console.error('Unmute error:', error);
      return { success: false, error: error.message };
    }
  }

  // Search posts
  async searchPosts(agent, query, { limit = 25, cursor } = {}) {
    try {
      const response = await agent.app.bsky.feed.searchPosts({ q: query, limit, cursor });
      return {
        posts: response.data.posts,
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Search posts error:', error);
      throw error;
    }
  }

  // Search actors
  async searchActors(agent, query, { limit = 25, cursor } = {}) {
    try {
      const response = await agent.searchActors({ term: query, limit, cursor });
      return {
        actors: response.data.actors,
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Search actors error:', error);
      throw error;
    }
  }

  // Get followers
  async getFollowers(agent, actor, { limit = 50, cursor } = {}) {
    try {
      const response = await agent.getFollowers({ actor, limit, cursor });
      return {
        followers: response.data.followers,
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Get followers error:', error);
      throw error;
    }
  }

  // Get follows
  async getFollows(agent, actor, { limit = 50, cursor } = {}) {
    try {
      const response = await agent.getFollows({ actor, limit, cursor });
      return {
        follows: response.data.follows,
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Get follows error:', error);
      throw error;
    }
  }

  // Get lists
  async getLists(agent, actor, { limit = 50, cursor } = {}) {
    try {
      const response = await agent.app.bsky.graph.getLists({ actor, limit, cursor });
      return {
        lists: response.data.lists,
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Get lists error:', error);
      throw error;
    }
  }

  // Get list feed
  async getListFeed(agent, list, { limit = 50, cursor } = {}) {
    try {
      const response = await agent.app.bsky.feed.getListFeed({ list, limit, cursor });
      return {
        feed: response.data.feed,
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Get list feed error:', error);
      throw error;
    }
  }

  // Upload blob (for images/media)
  async uploadBlob(agent, data, mimeType) {
    try {
      const response = await agent.uploadBlob(data, { encoding: mimeType });
      return {
        success: true,
        blob: response.data.blob,
      };
    } catch (error) {
      console.error('Upload blob error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get actor likes
  async getActorLikes(agent, actor, { limit = 50, cursor } = {}) {
    try {
      const response = await agent.app.bsky.feed.getActorLikes({ actor, limit, cursor });
      return {
        feed: response.data.feed,
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Get actor likes error:', error);
      throw error;
    }
  }

  // Get suggested feeds
  async getSuggestedFeeds(agent, { limit = 50, cursor } = {}) {
    try {
      const response = await agent.app.bsky.feed.getSuggestedFeeds({ limit, cursor });
      return {
        feeds: response.data.feeds,
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Get suggested feeds error:', error);
      throw error;
    }
  }

  // Get saved feeds
  async getSavedFeeds(agent) {
    try {
      const response = await agent.app.bsky.actor.getPreferences();
      const savedFeedsPref = response.data.preferences.find(
        (p) => p.$type === 'app.bsky.actor.defs#savedFeedsPref'
      );
      return savedFeedsPref?.saved || [];
    } catch (error) {
      console.error('Get saved feeds error:', error);
      throw error;
    }
  }

  // Report content
  async reportContent(agent, { reasonType, reason, subject }) {
    try {
      await agent.app.bsky.moderation.createReport({
        reasonType,
        reason,
        subject,
      });
      return { success: true };
    } catch (error) {
      console.error('Report content error:', error);
      return { success: false, error: error.message };
    }
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

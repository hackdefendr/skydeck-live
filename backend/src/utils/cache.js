import Redis from 'ioredis';
import config from '../config/index.js';

let redis = null;

export const getRedis = () => {
  if (!redis) {
    redis = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      lazyConnect: true,
    });

    redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    redis.on('connect', () => {
      console.log('Connected to Redis');
    });
  }
  return redis;
};

// In-flight request deduplication
const inFlightRequests = new Map();

export const cache = {
  async get(key) {
    try {
      const data = await getRedis().get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  async set(key, value, ttlSeconds = 300) {
    try {
      await getRedis().setex(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  async del(key) {
    try {
      await getRedis().del(key);
      return true;
    } catch (error) {
      console.error('Cache del error:', error);
      return false;
    }
  },

  async invalidatePattern(pattern) {
    try {
      const keys = await getRedis().keys(pattern);
      if (keys.length > 0) {
        await getRedis().del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Cache invalidate error:', error);
      return false;
    }
  },

  /**
   * Get or fetch with caching and request deduplication
   * Prevents duplicate concurrent requests for the same resource
   */
  async getOrFetch(key, fetchFn, ttlSeconds = 300) {
    // Check cache first
    const cached = await this.get(key);
    if (cached) {
      return cached;
    }

    // Check if there's already an in-flight request for this key
    if (inFlightRequests.has(key)) {
      return inFlightRequests.get(key);
    }

    // Create new request promise
    const requestPromise = (async () => {
      try {
        const result = await fetchFn();
        await this.set(key, result, ttlSeconds);
        return result;
      } finally {
        // Clean up in-flight request
        inFlightRequests.delete(key);
      }
    })();

    // Store the promise for deduplication
    inFlightRequests.set(key, requestPromise);

    return requestPromise;
  },

  /**
   * Batch get multiple keys at once
   */
  async mget(keys) {
    try {
      const values = await getRedis().mget(keys);
      return values.map((v) => (v ? JSON.parse(v) : null));
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  },

  /**
   * Batch set multiple key-value pairs
   */
  async mset(entries, ttlSeconds = 300) {
    try {
      const pipeline = getRedis().pipeline();
      for (const [key, value] of entries) {
        pipeline.setex(key, ttlSeconds, JSON.stringify(value));
      }
      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  },

  /**
   * Get cache stats for monitoring
   */
  getInFlightCount() {
    return inFlightRequests.size;
  },
};

// Cache keys with consistent naming
export const cacheKeys = {
  // User-related
  userProfile: (did) => `user:profile:${did}`,
  userFeed: (userId, feedType) => `user:feed:${userId}:${feedType}`,
  userPreferences: (did) => `user:preferences:${did}`,

  // Content
  post: (uri) => `post:${uri}`,
  postThread: (uri) => `post:thread:${uri}`,

  // Feeds
  notifications: (userId) => `user:notifications:${userId}`,
  timeline: (userId, cursor) => `user:timeline:${userId}:${cursor || 'latest'}`,
  customFeed: (feedUri, cursor) => `feed:custom:${feedUri}:${cursor || 'latest'}`,
  listFeed: (listUri, cursor) => `feed:list:${listUri}:${cursor || 'latest'}`,

  // Social graph
  followers: (did, cursor) => `graph:followers:${did}:${cursor || 'initial'}`,
  follows: (did, cursor) => `graph:follows:${did}:${cursor || 'initial'}`,
  lists: (did) => `graph:lists:${did}`,

  // Search (short TTL)
  searchPosts: (query, cursor) => `search:posts:${query}:${cursor || 'initial'}`,
  searchActors: (query, cursor) => `search:actors:${query}:${cursor || 'initial'}`,

  // Suggestions (longer TTL)
  suggestedFeeds: (cursor) => `suggested:feeds:${cursor || 'initial'}`,
  suggestedActors: (cursor) => `suggested:actors:${cursor || 'initial'}`,
};

// TTL values in seconds
export const cacheTTL = {
  profile: 300,       // 5 minutes
  feed: 60,           // 1 minute
  timeline: 30,       // 30 seconds
  notifications: 30,  // 30 seconds
  postThread: 120,    // 2 minutes
  search: 60,         // 1 minute
  suggestions: 600,   // 10 minutes
  preferences: 300,   // 5 minutes
  socialGraph: 180,   // 3 minutes
};

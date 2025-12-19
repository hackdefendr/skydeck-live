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
};

// Cache keys
export const cacheKeys = {
  userProfile: (did) => `user:profile:${did}`,
  userFeed: (userId, feedType) => `user:feed:${userId}:${feedType}`,
  post: (uri) => `post:${uri}`,
  notifications: (userId) => `user:notifications:${userId}`,
  timeline: (userId, cursor) => `user:timeline:${userId}:${cursor || 'latest'}`,
};

/**
 * Rate Limiter with Exponential Backoff for Bluesky API
 *
 * Implements:
 * - Token bucket algorithm for rate limiting
 * - Exponential backoff with jitter for retries
 * - Request queuing to prevent bursts
 * - Automatic retry on rate limit errors (429)
 */

// Bluesky rate limits (approximate based on AT Protocol)
const RATE_LIMITS = {
  // Auth endpoints - very strict
  auth: {
    maxRequests: 10,
    windowMs: 5 * 60 * 1000, // 5 minutes
    minDelayMs: 1000,
  },
  // General API endpoints
  general: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    minDelayMs: 50,
  },
  // Write operations (posts, likes, etc.)
  write: {
    maxRequests: 50,
    windowMs: 60 * 1000, // 1 minute
    minDelayMs: 100,
  },
  // Read operations (feeds, profiles, etc.)
  read: {
    maxRequests: 200,
    windowMs: 60 * 1000, // 1 minute
    minDelayMs: 25,
  },
};

class RateLimiter {
  constructor() {
    this.buckets = new Map();
    this.requestQueues = new Map();
    this.processing = new Map();
  }

  /**
   * Get or create a token bucket for a category
   */
  getBucket(category) {
    if (!this.buckets.has(category)) {
      const limits = RATE_LIMITS[category] || RATE_LIMITS.general;
      this.buckets.set(category, {
        tokens: limits.maxRequests,
        maxTokens: limits.maxRequests,
        windowMs: limits.windowMs,
        minDelayMs: limits.minDelayMs,
        lastRefill: Date.now(),
        requests: [],
      });
    }
    return this.buckets.get(category);
  }

  /**
   * Refill tokens based on time elapsed
   */
  refillTokens(bucket) {
    const now = Date.now();
    const elapsed = now - bucket.lastRefill;

    // Remove old requests outside the window
    bucket.requests = bucket.requests.filter(
      (timestamp) => now - timestamp < bucket.windowMs
    );

    // Calculate available tokens based on requests in window
    bucket.tokens = Math.max(0, bucket.maxTokens - bucket.requests.length);
    bucket.lastRefill = now;

    return bucket.tokens;
  }

  /**
   * Check if we can make a request
   */
  canMakeRequest(category) {
    const bucket = this.getBucket(category);
    this.refillTokens(bucket);
    return bucket.tokens > 0;
  }

  /**
   * Consume a token for a request
   */
  consumeToken(category) {
    const bucket = this.getBucket(category);
    this.refillTokens(bucket);

    if (bucket.tokens > 0) {
      bucket.tokens--;
      bucket.requests.push(Date.now());
      return true;
    }
    return false;
  }

  /**
   * Get wait time until next available token
   */
  getWaitTime(category) {
    const bucket = this.getBucket(category);
    this.refillTokens(bucket);

    if (bucket.tokens > 0) {
      return bucket.minDelayMs;
    }

    // Find the oldest request and calculate when it expires
    if (bucket.requests.length > 0) {
      const oldestRequest = Math.min(...bucket.requests);
      const waitTime = (oldestRequest + bucket.windowMs) - Date.now();
      return Math.max(waitTime, bucket.minDelayMs);
    }

    return bucket.minDelayMs;
  }

  /**
   * Calculate exponential backoff delay with jitter
   */
  calculateBackoff(attempt, baseDelay = 1000, maxDelay = 60000) {
    // Exponential backoff: baseDelay * 2^attempt
    const exponentialDelay = baseDelay * Math.pow(2, attempt);

    // Cap at maxDelay
    const cappedDelay = Math.min(exponentialDelay, maxDelay);

    // Add jitter (random value between 0 and 50% of delay)
    const jitter = Math.random() * cappedDelay * 0.5;

    return Math.floor(cappedDelay + jitter);
  }

  /**
   * Sleep for a given duration
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Execute a request with rate limiting and exponential backoff
   */
  async execute(category, requestFn, options = {}) {
    const {
      maxRetries = 5,
      baseDelay = 1000,
      maxDelay = 60000,
      onRetry = null,
    } = options;

    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      // Wait for rate limit if needed
      while (!this.canMakeRequest(category)) {
        const waitTime = this.getWaitTime(category);
        console.log(`Rate limit reached for ${category}, waiting ${waitTime}ms`);
        await this.sleep(waitTime);
      }

      // Consume token
      this.consumeToken(category);

      try {
        // Execute the request
        const result = await requestFn();
        return result;
      } catch (error) {
        lastError = error;

        // Check if it's a rate limit error
        const isRateLimitError =
          error.status === 429 ||
          error.message?.includes('RateLimitExceeded') ||
          error.message?.includes('Rate Limit');

        if (isRateLimitError) {
          // Clear bucket tokens on rate limit error
          const bucket = this.getBucket(category);
          bucket.tokens = 0;

          if (attempt < maxRetries) {
            const backoffDelay = this.calculateBackoff(attempt, baseDelay, maxDelay);
            console.log(
              `Rate limit hit for ${category}, attempt ${attempt + 1}/${maxRetries + 1}, ` +
              `backing off for ${backoffDelay}ms`
            );

            if (onRetry) {
              onRetry(attempt, backoffDelay, error);
            }

            await this.sleep(backoffDelay);
            continue;
          }
        }

        // For non-rate-limit errors, check if retryable
        const isRetryableError =
          error.status >= 500 ||
          error.code === 'ECONNRESET' ||
          error.code === 'ETIMEDOUT' ||
          error.code === 'ENOTFOUND';

        if (isRetryableError && attempt < maxRetries) {
          const backoffDelay = this.calculateBackoff(attempt, baseDelay / 2, maxDelay / 2);
          console.log(
            `Retryable error for ${category}, attempt ${attempt + 1}/${maxRetries + 1}, ` +
            `backing off for ${backoffDelay}ms`
          );

          if (onRetry) {
            onRetry(attempt, backoffDelay, error);
          }

          await this.sleep(backoffDelay);
          continue;
        }

        // Non-retryable error, throw immediately
        throw error;
      }
    }

    // All retries exhausted
    throw lastError;
  }

  /**
   * Execute a request with queuing to prevent bursts
   */
  async executeQueued(category, requestFn, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.requestQueues.has(category)) {
        this.requestQueues.set(category, []);
      }

      const queue = this.requestQueues.get(category);
      queue.push({ requestFn, options, resolve, reject });

      this.processQueue(category);
    });
  }

  /**
   * Process queued requests for a category
   */
  async processQueue(category) {
    if (this.processing.get(category)) {
      return;
    }

    this.processing.set(category, true);
    const queue = this.requestQueues.get(category);
    const bucket = this.getBucket(category);

    while (queue && queue.length > 0) {
      const { requestFn, options, resolve, reject } = queue.shift();

      try {
        // Add minimum delay between requests
        await this.sleep(bucket.minDelayMs);

        const result = await this.execute(category, requestFn, options);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.processing.set(category, false);
  }

  /**
   * Get current rate limit status for monitoring
   */
  getStatus(category) {
    const bucket = this.getBucket(category);
    this.refillTokens(bucket);

    return {
      category,
      availableTokens: bucket.tokens,
      maxTokens: bucket.maxTokens,
      requestsInWindow: bucket.requests.length,
      windowMs: bucket.windowMs,
      utilizationPercent: ((bucket.maxTokens - bucket.tokens) / bucket.maxTokens) * 100,
    };
  }

  /**
   * Get status for all categories
   */
  getAllStatus() {
    const status = {};
    for (const category of Object.keys(RATE_LIMITS)) {
      status[category] = this.getStatus(category);
    }
    return status;
  }

  /**
   * Reset a specific category's rate limit (for testing)
   */
  reset(category) {
    this.buckets.delete(category);
  }

  /**
   * Reset all rate limits (for testing)
   */
  resetAll() {
    this.buckets.clear();
    this.requestQueues.clear();
    this.processing.clear();
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Helper functions for common categories
export const withRateLimit = {
  auth: (fn, options) => rateLimiter.execute('auth', fn, { maxRetries: 3, baseDelay: 2000, ...options }),
  read: (fn, options) => rateLimiter.execute('read', fn, { maxRetries: 5, baseDelay: 500, ...options }),
  write: (fn, options) => rateLimiter.execute('write', fn, { maxRetries: 3, baseDelay: 1000, ...options }),
  general: (fn, options) => rateLimiter.execute('general', fn, { maxRetries: 4, baseDelay: 1000, ...options }),
};

export default rateLimiter;

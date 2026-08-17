// TMDB API Rate Limiter
// Sliding window implementation for rate limiting

import type { TmdbRateLimitConfig } from './types';

interface RequestTimestamp {
  timestamp: number;
}

export class TmdbRateLimiter {
  private requests: RequestTimestamp[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(config: TmdbRateLimitConfig = { maxRequests: 40, windowMs: 10000 }) {
    this.maxRequests = config.maxRequests;
    this.windowMs = config.windowMs;
  }

  /**
   * Get the number of milliseconds until the next request can be made
   */
  private getWaitTime(): number {
    const now = Date.now();
    
    // Remove timestamps outside the window
    this.requests = this.requests.filter(
      (req) => now - req.timestamp < this.windowMs
    );

    // If we're under the limit, no wait needed
    if (this.requests.length < this.maxRequests) {
      return 0;
    }

    // Find the oldest request in the window
    const oldestRequest = this.requests[0];
    const timeSinceOldest = now - oldestRequest.timestamp;
    
    // Wait until the oldest request falls outside the window
    return Math.max(0, this.windowMs - timeSinceOldest);
  }

  /**
   * Acquire permission to make a request
   * Returns a promise that resolves when the request can be made
   */
  async acquire(): Promise<void> {
    const waitTime = this.getWaitTime();
    
    if (waitTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    // Record this request
    this.requests.push({ timestamp: Date.now() });
  }

  /**
   * Get current rate limit status
   */
  getStatus(): { used: number; remaining: number; resetIn: number } {
    const now = Date.now();
    
    // Remove timestamps outside the window
    this.requests = this.requests.filter(
      (req) => now - req.timestamp < this.windowMs
    );

    const used = this.requests.length;
    const remaining = Math.max(0, this.maxRequests - used);
    
    // Calculate when the oldest request in the window will expire
    let resetIn = 0;
    if (this.requests.length > 0) {
      const oldestRequest = this.requests[0];
      const timeSinceOldest = now - oldestRequest.timestamp;
      resetIn = Math.max(0, this.windowMs - timeSinceOldest);
    }

    return { used, remaining, resetIn };
  }

  /**
   * Reset the rate limiter
   */
  reset(): void {
    this.requests = [];
  }
}

export default TmdbRateLimiter;

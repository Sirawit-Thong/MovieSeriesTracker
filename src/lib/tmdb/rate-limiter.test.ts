import {describe, it, expect} from 'vitest';
import {TmdbRateLimiter, globalTmdbRateLimiter} from './rate-limiter';
import {TmdbClient} from './client';

describe('global TMDB rate limiter', () => {
  it('exports a shared singleton', () => {
    expect(globalTmdbRateLimiter).toBeInstanceOf(TmdbRateLimiter);
  });

  it('TmdbClient instances share the global limiter by default', () => {
    const a = new TmdbClient();
    const b = new TmdbClient();
    expect((a as unknown as {rateLimiter: TmdbRateLimiter}).rateLimiter)
      .toBe((b as unknown as {rateLimiter: TmdbRateLimiter}).rateLimiter);
  });

  it('accepts a per-instance override', () => {
    const custom = new TmdbRateLimiter({maxRequests: 5, windowMs: 1000});
    const c = new TmdbClient({rateLimiter: custom});
    expect((c as unknown as {rateLimiter: TmdbRateLimiter}).rateLimiter).toBe(custom);
  });
});

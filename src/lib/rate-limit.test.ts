import {describe, it, expect, beforeEach} from 'vitest';

const rateLimitMap = new Map<string, {count: number; resetAt: number}>();

function getRateLimitKey(ip: string, pathname: string) {
  return `${ip}:${pathname}`;
}

function checkRateLimit(
  ip: string,
  pathname: string,
  max: number,
  windowMs: number
): {limited: boolean; remaining: number} {
  const key = getRateLimitKey(ip, pathname);
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, {count: 1, resetAt: now + windowMs});
    return {limited: false, remaining: max - 1};
  }

  if (entry.count >= max) {
    return {limited: true, remaining: 0};
  }

  entry.count++;
  return {limited: false, remaining: max - entry.count};
}

describe('rate limiter logic', () => {
  beforeEach(() => {
    rateLimitMap.clear();
  });

  it('should allow requests under the limit', () => {
    const result = checkRateLimit('127.0.0.1', '/api/search', 10, 60000);
    expect(result.limited).toBe(false);
    expect(result.remaining).toBe(9);
  });

  it('should block requests over the limit', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit('127.0.0.1', '/api/auth/register', 5, 60000);
    }
    const result = checkRateLimit('127.0.0.1', '/api/auth/register', 5, 60000);
    expect(result.limited).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('should track different IPs separately', () => {
    checkRateLimit('127.0.0.1', '/api/search', 2, 60000);
    checkRateLimit('127.0.0.1', '/api/search', 2, 60000);

    const result1 = checkRateLimit('127.0.0.1', '/api/search', 2, 60000);
    const result2 = checkRateLimit('192.168.1.1', '/api/search', 2, 60000);

    expect(result1.limited).toBe(true);
    expect(result2.limited).toBe(false);
  });

  it('should track different paths separately', () => {
    checkRateLimit('127.0.0.1', '/api/auth/register', 2, 60000);
    checkRateLimit('127.0.0.1', '/api/auth/register', 2, 60000);

    const result = checkRateLimit('127.0.0.1', '/api/search', 10, 60000);
    expect(result.limited).toBe(false);
  });

  it('should reset after window expires', async () => {
    checkRateLimit('127.0.0.1', '/api/search', 2, 1);
    checkRateLimit('127.0.0.1', '/api/search', 2, 1);
    const limited = checkRateLimit('127.0.0.1', '/api/search', 2, 1);
    expect(limited.limited).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 10));
    const afterReset = checkRateLimit('127.0.0.1', '/api/search', 2, 1);
    expect(afterReset.limited).toBe(false);
  });
});

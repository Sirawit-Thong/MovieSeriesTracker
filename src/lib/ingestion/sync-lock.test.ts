import {describe, it, expect} from 'vitest';
import {isSyncLockExpired} from './sync-lock';

describe('sync lock staleness', () => {
  it('expires locks older than 30 minutes', () => {
    const createdAt = new Date(Date.now() - 31 * 60 * 1000);
    expect(isSyncLockExpired(createdAt)).toBe(true);
  });

  it('keeps fresh locks active', () => {
    const createdAt = new Date(Date.now() - 60 * 1000);
    expect(isSyncLockExpired(createdAt)).toBe(false);
  });
});

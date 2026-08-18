import {describe, it, expect} from 'vitest';
import {isLockConflict, isSyncLockExpired, normalizeEntity} from './sync-lock';

describe('sync lock conflict detection', () => {
  it('conflicts when the active lock is all', () => {
    expect(isLockConflict('all', 'movie')).toBe(true);
  });

  it('conflicts when the new lock is all', () => {
    expect(isLockConflict('movie', 'all')).toBe(true);
  });

  it('conflicts when both sides are all', () => {
    expect(isLockConflict('all', 'all')).toBe(true);
  });

  it('conflicts on the same entity', () => {
    expect(isLockConflict('movie', 'movie')).toBe(true);
  });

  it('does not conflict on different entities', () => {
    expect(isLockConflict('movie', 'tv')).toBe(false);
  });

  it('conflicts for legacy aliased entities after normalization', () => {
    expect(isLockConflict(normalizeEntity('movies'), normalizeEntity('movie'))).toBe(true);
  });
});

describe('sync lock entity normalization', () => {
  it('maps movies to movie', () => {
    expect(normalizeEntity('movies')).toBe('movie');
  });

  it('maps persons to person', () => {
    expect(normalizeEntity('persons')).toBe('person');
  });

  it('keeps tv unchanged', () => {
    expect(normalizeEntity('tv')).toBe('tv');
  });

  it('keeps all unchanged', () => {
    expect(normalizeEntity('all')).toBe('all');
  });
});

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

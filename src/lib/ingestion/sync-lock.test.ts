import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isLockConflict,
  isSyncLockExpired,
  normalizeEntity,
  requestSyncCancellation,
  isSyncCancellationRequested,
} from './sync-lock';

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  updateMany: vi.fn(),
  findUnique: vi.fn(),
}));

vi.mock('../db', () => ({
  default: {
    syncLog: {
      findFirst: mocks.findFirst,
      updateMany: mocks.updateMany,
      findUnique: mocks.findUnique,
    },
  },
}));

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

describe('sync cancellation helpers', () => {
  beforeEach(() => {
    mocks.findFirst.mockReset();
    mocks.updateMany.mockReset();
    mocks.findUnique.mockReset();
  });

  it('requestSyncCancellation only touches a running sync log', async () => {
    mocks.updateMany.mockResolvedValue({ count: 1 });
    const result = await requestSyncCancellation(42);
    expect(result).toBe(true);
    expect(mocks.updateMany).toHaveBeenCalledWith({
      where: { id: 42, status: 'running' },
      data: { cancelRequested: true },
    });
  });

  it('requestSyncCancellation reports false when no running log exists', async () => {
    mocks.updateMany.mockResolvedValue({ count: 0 });
    const result = await requestSyncCancellation(42);
    expect(result).toBe(false);
  });

  it('isSyncCancellationRequested reflects the stored flag', async () => {
    mocks.findUnique.mockResolvedValue({ cancelRequested: true });
    expect(await isSyncCancellationRequested(42)).toBe(true);

    mocks.findUnique.mockResolvedValue({ cancelRequested: false });
    expect(await isSyncCancellationRequested(42)).toBe(false);

    mocks.findUnique.mockResolvedValue(null);
    expect(await isSyncCancellationRequested(42)).toBe(false);
  });
});

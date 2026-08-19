import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isLockConflict,
  isSyncLockExpired,
  normalizeEntity,
  requestSyncCancellation,
  isSyncCancellationRequested,
  touchSyncHeartbeat,
  markStaleSyncsStopped,
} from './sync-lock';

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  updateMany: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock('../db', () => ({
  default: {
    syncLog: {
      findFirst: mocks.findFirst,
      updateMany: mocks.updateMany,
      findUnique: mocks.findUnique,
      update: mocks.update,
      findMany: mocks.findMany,
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
    mocks.update.mockReset();
    mocks.findMany.mockReset();
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

describe('sync heartbeat', () => {
  beforeEach(() => {
    mocks.update.mockReset();
    mocks.findMany.mockReset();
  });

  it('touchSyncHeartbeat stamps the current time on the sync log', async () => {
    mocks.update.mockResolvedValue({});
    await touchSyncHeartbeat(7);
    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { lastHeartbeatAt: expect.any(Date) },
    });
  });

  it('markStaleSyncsStopped finalizes orphaned running syncs', async () => {
    const now = Date.now();
    mocks.findMany.mockResolvedValue([
      { id: 1, cancelRequested: true },
      { id: 2, cancelRequested: false },
    ]);
    const count = await markStaleSyncsStopped(now);
    expect(count).toBe(2);
    expect(mocks.findMany).toHaveBeenCalledWith({
      where: {
        status: 'running',
        OR: [
          { lastHeartbeatAt: null, startedAt: { lt: expect.any(Date) } },
          { lastHeartbeatAt: { lt: expect.any(Date) } },
        ],
      },
      select: { id: true, cancelRequested: true },
    });
    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: 'cancelled', endedAt: expect.any(Date) },
    });
    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { status: 'failed', endedAt: expect.any(Date) },
    });
  });

  it('markStaleSyncsStopped leaves a fresh running sync untouched', async () => {
    mocks.findMany.mockResolvedValue([]);
    const count = await markStaleSyncsStopped(Date.now());
    expect(count).toBe(0);
    expect(mocks.update).not.toHaveBeenCalled();
  });
});

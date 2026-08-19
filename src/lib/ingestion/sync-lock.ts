import prisma from '../db';

const LOCK_TIMEOUT_MS = 30 * 60 * 1000;
const STALE_SYNC_MS = 5 * 60 * 1000;

const ENTITY_ALIASES: Record<string, string> = { movies: 'movie', persons: 'person' };

export function normalizeEntity(entity: string): string {
  return ENTITY_ALIASES[entity] ?? entity;
}

export function isLockConflict(activeEntity: string, newEntity: string): boolean {
  return activeEntity === 'all' || newEntity === 'all' || activeEntity === newEntity;
}

export function isSyncLockExpired(createdAt: Date, now: number = Date.now()): boolean {
  return now - createdAt.getTime() > LOCK_TIMEOUT_MS;
}

export async function acquireSyncLock(entity: string): Promise<{ id: number } | null> {
  const normalized = normalizeEntity(entity);
  const now = new Date();

  await markStaleSyncsStopped(now.getTime());

  const active = await prisma.syncLog.findFirst({
    where: {
      status: 'running',
    },
  });

  if (
    active &&
    !isSyncLockExpired(active.startedAt, now.getTime()) &&
    isLockConflict(normalizeEntity(active.entity), normalized)
  ) {
    return null;
  }

  if (active) {
    await prisma.syncLog.update({
      where: { id: active.id },
      data: { status: 'failed', endedAt: now },
    });
  }

  return prisma.syncLog.create({
    data: { entity: normalized, status: 'running' },
    select: { id: true },
  });
}

export async function finishSyncLog(
  id: number,
  status: 'completed' | 'failed' | 'cancelled',
  processed: number,
  errors: number,
  duration: number,
  details: string,
): Promise<void> {
  await prisma.syncLog.update({
    where: { id },
    data: { status, processed, errors, duration, details, endedAt: new Date() },
  });
}

export async function requestSyncCancellation(syncLogId: number): Promise<boolean> {
  const result = await prisma.syncLog.updateMany({
    where: { id: syncLogId, status: 'running' },
    data: { cancelRequested: true },
  });
  return result.count > 0;
}

export async function isSyncCancellationRequested(syncLogId: number): Promise<boolean> {
  const log = await prisma.syncLog.findUnique({
    where: { id: syncLogId },
    select: { cancelRequested: true },
  });
  return log?.cancelRequested ?? false;
}

export async function touchSyncHeartbeat(syncLogId: number): Promise<void> {
  await prisma.syncLog.update({
    where: { id: syncLogId },
    data: { lastHeartbeatAt: new Date() },
  });
}

/**
 * Mark running sync logs whose process is no longer alive (no recent heartbeat)
 * as stopped, so orphaned rows don't block future syncs or the admin UI.
 * Rows the admin asked to cancel are recorded as 'cancelled'; the rest as 'failed'.
 */
export async function markStaleSyncsStopped(now: number = Date.now()): Promise<number> {
  const cutoff = new Date(now - STALE_SYNC_MS);
  const stale = await prisma.syncLog.findMany({
    where: {
      status: 'running',
      OR: [
        { lastHeartbeatAt: null, startedAt: { lt: cutoff } },
        { lastHeartbeatAt: { lt: cutoff } },
      ],
    },
    select: { id: true, cancelRequested: true },
  });

  for (const s of stale) {
    await prisma.syncLog.update({
      where: { id: s.id },
      data: {
        status: s.cancelRequested ? 'cancelled' : 'failed',
        endedAt: new Date(),
      },
    });
  }

  return stale.length;
}

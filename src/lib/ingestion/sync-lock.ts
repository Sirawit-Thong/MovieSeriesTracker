import prisma from '../db';

const LOCK_TIMEOUT_MS = 30 * 60 * 1000;

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

import prisma from '../db';

const LOCK_TIMEOUT_MS = 30 * 60 * 1000;

export function isSyncLockExpired(createdAt: Date, now: number = Date.now()): boolean {
  return now - createdAt.getTime() > LOCK_TIMEOUT_MS;
}

export async function acquireSyncLock(
  entity: string
): Promise<{id: number} | null> {
  const now = new Date();

  const active = await prisma.syncLog.findFirst({
    where: {
      entity,
      status: 'running',
    },
  });

  if (active && !isSyncLockExpired(active.startedAt, now.getTime())) {
    return null;
  }

  if (active) {
    await prisma.syncLog.update({
      where: {id: active.id},
      data: {status: 'failed', endedAt: now},
    });
  }

  return prisma.syncLog.create({
    data: {entity, status: 'running'},
    select: {id: true},
  });
}

export async function finishSyncLog(
  id: number,
  status: 'completed' | 'failed',
  processed: number,
  errors: number,
  duration: number,
  details: string
): Promise<void> {
  await prisma.syncLog.update({
    where: {id},
    data: {status, processed, errors, duration, details, endedAt: new Date()},
  });
}

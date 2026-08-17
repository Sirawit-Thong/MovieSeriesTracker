// User Annotation & Watchlist Query Service Layer
// Provides CRUD functions for user annotations, watchlists, and watchlist items.

import {prisma} from '../db';
import type {WatchStatus} from '../../../generated/prisma/client';

// ============================================================
// Annotation Queries
// ============================================================

/**
 * Get a single annotation for a specific entity.
 * @returns The annotation or null if none exists.
 */
export async function getAnnotation(
  userId: string,
  entityType: string,
  entityId: number
) {
  return prisma.userAnnotation.findUnique({
    where: {
      userId_entityType_entityId: {userId, entityType, entityId},
    },
  });
}

/**
 * Get all annotations for a user, optionally filtered by status or entity type.
 */
export async function getUserAnnotations(
  userId: string,
  filters?: {status?: WatchStatus; entityType?: string}
) {
  return prisma.userAnnotation.findMany({
    where: {
      userId,
      ...(filters?.status ? {watchStatus: filters.status} : {}),
      ...(filters?.entityType ? {entityType: filters.entityType} : {}),
    },
    orderBy: {updatedAt: 'desc'},
  });
}

/**
 * Create or update an annotation for a specific entity.
 * Uses Prisma upsert to handle the unique constraint on [userId, entityType, entityId].
 */
export async function upsertAnnotation(
  userId: string,
  entityType: string,
  entityId: number,
  data: {
    watchStatus?: WatchStatus | null;
    personalRating?: number | null;
    currentEpisode?: number | null;
    totalEpisodes?: number | null;
    notes?: string | null;
    watchDate?: Date | null;
  }
) {
  return prisma.userAnnotation.upsert({
    where: {
      userId_entityType_entityId: {userId, entityType, entityId},
    },
    create: {
      userId,
      entityType,
      entityId,
      ...data,
    },
    update: {
      ...data,
    },
  });
}

/**
 * Delete an annotation by its ID.
 */
export async function deleteAnnotation(id: number) {
  return prisma.userAnnotation.delete({where: {id}});
}

// ============================================================
// Watchlist Queries
// ============================================================

/**
 * Get all watchlists for a user with item counts.
 */
export async function getWatchlists(userId: string) {
  return prisma.watchlist.findMany({
    where: {userId},
    include: {
      _count: {select: {items: true}},
    },
    orderBy: {updatedAt: 'desc'},
  });
}

/**
 * Get a single watchlist with all its items.
 */
export async function getWatchlistWithItems(id: number) {
  return prisma.watchlist.findUnique({
    where: {id},
    include: {
      items: {
        orderBy: {createdAt: 'desc'},
      },
    },
  });
}

/**
 * Create a new watchlist.
 */
export async function createWatchlist(
  userId: string,
  data: {name: string; description?: string | null}
) {
  return prisma.watchlist.create({
    data: {
      userId,
      ...data,
    },
  });
}

/**
 * Update a watchlist's name and description.
 */
export async function updateWatchlist(
  id: number,
  data: {name?: string; description?: string | null}
) {
  return prisma.watchlist.update({
    where: {id},
    data,
  });
}

/**
 * Delete a watchlist and all its items (cascade).
 */
export async function deleteWatchlist(id: number) {
  return prisma.watchlist.delete({where: {id}});
}

/**
 * Add an item to a watchlist.
 */
export async function addWatchlistItem(
  watchlistId: number,
  entityType: string,
  entityId: number
) {
  return prisma.watchlistItem.create({
    data: {
      watchlistId,
      entityType,
      entityId,
    },
  });
}

/**
 * Remove an item from a watchlist.
 */
export async function removeWatchlistItem(
  watchlistId: number,
  entityType: string,
  entityId: number
) {
  return prisma.watchlistItem.delete({
    where: {
      watchlistId_entityType_entityId: {watchlistId, entityType, entityId},
    },
  });
}

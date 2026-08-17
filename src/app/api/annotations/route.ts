// Annotations API Route
// GET  /api/annotations              — list annotations (optional: entityType, entityId, status filters)
// POST /api/annotations              — create or update an annotation

import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/config';
import {
  getAnnotation,
  getUserAnnotations,
  upsertAnnotation,
} from '@/lib/db/user-queries';
import type {WatchStatus} from '../../../../generated/prisma/client';

const VALID_ENTITY_TYPES = ['MOVIE', 'TV', 'PERSON'] as const;
const VALID_WATCH_STATUSES: readonly WatchStatus[] = [
  'WATCHED',
  'WATCHING',
  'WANT_TO_WATCH',
  'DROPPED',
] as const;

// ── GET ──────────────────────────────────────────────────────

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }
  const userId = session.user.id;

  const {searchParams} = new URL(request.url);

  const entityType = searchParams.get('entityType');
  const entityId = searchParams.get('entityId');
  const status = searchParams.get('status') as WatchStatus | null;

  // Single-entity lookup: entityType + entityId
  if (entityType && entityId) {
    const id = Number(entityId);
    if (!VALID_ENTITY_TYPES.includes(entityType as typeof VALID_ENTITY_TYPES[number])) {
      return NextResponse.json(
        {error: `Invalid entityType: ${entityType}. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`},
        {status: 400}
      );
    }
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {error: 'entityId must be a positive integer'},
        {status: 400}
      );
    }

    const annotation = await getAnnotation(userId, entityType, id);
    return NextResponse.json(annotation ?? null);
  }

  // List annotations with optional status filter
  if (status && !VALID_WATCH_STATUSES.includes(status)) {
    return NextResponse.json(
      {error: `Invalid status: ${status}. Must be one of: ${VALID_WATCH_STATUSES.join(', ')}`},
      {status: 400}
    );
  }

  const annotations = await getUserAnnotations(userId, {
    status: status ?? undefined,
  });

  return NextResponse.json(annotations);
}

// ── POST ─────────────────────────────────────────────────────

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }
  const userId = session.user.id;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({error: 'Invalid JSON body'}, {status: 400});
  }

  const {entityType, entityId, watchStatus, personalRating, currentEpisode, totalEpisodes, notes, watchDate} = body;

  // Validate required fields
  if (!entityType || typeof entityType !== 'string') {
    return NextResponse.json(
      {error: 'entityType is required and must be a string'},
      {status: 400}
    );
  }
  if (!VALID_ENTITY_TYPES.includes(entityType as typeof VALID_ENTITY_TYPES[number])) {
    return NextResponse.json(
      {error: `Invalid entityType: ${entityType}. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`},
      {status: 400}
    );
  }
  if (typeof entityId !== 'number' || !Number.isInteger(entityId) || entityId <= 0) {
    return NextResponse.json(
      {error: 'entityId is required and must be a positive integer'},
      {status: 400}
    );
  }

  // Validate optional fields
  if (watchStatus !== undefined && watchStatus !== null) {
    if (!VALID_WATCH_STATUSES.includes(watchStatus as WatchStatus)) {
      return NextResponse.json(
        {error: `Invalid watchStatus: ${watchStatus}. Must be one of: ${VALID_WATCH_STATUSES.join(', ')}`},
        {status: 400}
      );
    }
  }

  if (personalRating !== undefined && personalRating !== null) {
    if (typeof personalRating !== 'number' || !Number.isInteger(personalRating) || personalRating < 1 || personalRating > 10) {
      return NextResponse.json(
        {error: 'personalRating must be an integer between 1 and 10, or null'},
        {status: 400}
      );
    }
  }

  if (currentEpisode !== undefined && currentEpisode !== null) {
    if (typeof currentEpisode !== 'number' || !Number.isInteger(currentEpisode) || currentEpisode < 0) {
      return NextResponse.json(
        {error: 'currentEpisode must be a non-negative integer or null'},
        {status: 400}
      );
    }
  }

  if (totalEpisodes !== undefined && totalEpisodes !== null) {
    if (typeof totalEpisodes !== 'number' || !Number.isInteger(totalEpisodes) || totalEpisodes < 0) {
      return NextResponse.json(
        {error: 'totalEpisodes must be a non-negative integer or null'},
        {status: 400}
      );
    }
  }

  if (notes !== undefined && notes !== null && typeof notes !== 'string') {
    return NextResponse.json(
      {error: 'notes must be a string or null'},
      {status: 400}
    );
  }

  let watchDateValue: Date | null = null;
  if (watchDate !== undefined && watchDate !== null) {
    const parsed = new Date(watchDate as string);
    if (isNaN(parsed.getTime())) {
      return NextResponse.json(
        {error: 'watchDate must be a valid ISO 8601 date string'},
        {status: 400}
      );
    }
    watchDateValue = parsed;
  }

  const annotation = await upsertAnnotation(userId, entityType, entityId, {
    watchStatus: (watchStatus as WatchStatus) ?? null,
    personalRating: (personalRating as number) ?? null,
    currentEpisode: (currentEpisode as number) ?? null,
    totalEpisodes: (totalEpisodes as number) ?? null,
    notes: (notes as string) ?? null,
    watchDate: watchDateValue,
  });

  return NextResponse.json(annotation, {status: 200});
}

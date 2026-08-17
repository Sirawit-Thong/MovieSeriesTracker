// Library Save API Route
// POST /api/library/save — fetch entity from TMDB if needed, add to user's library

import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/config';
import {fetchOnMiss} from '@/lib/ingestion/on-demand';
import {upsertAnnotation} from '@/lib/db/user-queries';
import type {WatchStatus} from '../../../../../generated/prisma/client';

const VALID_ENTITY_TYPES = ['movie', 'tv'] as const;

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

  const {entityType, tmdbId, watchStatus} = body;

  if (!entityType || !VALID_ENTITY_TYPES.includes(entityType as typeof VALID_ENTITY_TYPES[number])) {
    return NextResponse.json(
      {error: `Invalid entityType: ${entityType}. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`},
      {status: 400}
    );
  }

  if (typeof tmdbId !== 'number' || !Number.isInteger(tmdbId) || tmdbId <= 0) {
    return NextResponse.json(
      {error: 'tmdbId is required and must be a positive integer'},
      {status: 400}
    );
  }

  const status = (watchStatus as WatchStatus) || 'WANT_TO_WATCH';

  // Fetch entity from TMDB if not in DB yet
  const result = await fetchOnMiss(entityType as 'movie' | 'tv', tmdbId);
  if (!result) {
    return NextResponse.json(
      {error: 'Failed to fetch entity from TMDB'},
      {status: 502}
    );
  }

  // Upsert annotation (add to library)
  const annotation = await upsertAnnotation(
    userId,
    String(entityType).toUpperCase(),
    result.dbId,
    {watchStatus: status}
  );

  return NextResponse.json(annotation, {status: 200});
}

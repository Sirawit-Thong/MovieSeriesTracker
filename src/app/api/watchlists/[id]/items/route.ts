// Watchlist Items API Route
// POST   /api/watchlists/[id]/items  — add an item to a watchlist
// DELETE /api/watchlists/[id]/items  — remove an item from a watchlist

import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/config';
import {addWatchlistItem, removeWatchlistItem} from '@/lib/db/user-queries';
import {prisma} from '@/lib/db';

const VALID_ENTITY_TYPES = ['MOVIE', 'TV', 'PERSON'] as const;

// ── POST ─────────────────────────────────────────────────────

export async function POST(
  request: Request,
  {params}: {params: Promise<{id: string}>}
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const {id: idStr} = await params;
  const watchlistId = Number(idStr);

  if (!Number.isInteger(watchlistId) || watchlistId <= 0) {
    return NextResponse.json(
      {error: 'Invalid watchlist ID'},
      {status: 400}
    );
  }

  // Ensure watchlist exists and belongs to user
  const watchlist = await prisma.watchlist.findUnique({where: {id: watchlistId}});
  if (!watchlist || watchlist.userId !== session.user.id) {
    return NextResponse.json(
      {error: 'Watchlist not found'},
      {status: 404}
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({error: 'Invalid JSON body'}, {status: 400});
  }

  const {entityType, entityId} = body;

  if (!entityType || !VALID_ENTITY_TYPES.includes(entityType as typeof VALID_ENTITY_TYPES[number])) {
    return NextResponse.json(
      {error: `entityType is required and must be one of: ${VALID_ENTITY_TYPES.join(', ')}`},
      {status: 400}
    );
  }

  if (typeof entityId !== 'number' || !Number.isInteger(entityId) || entityId <= 0) {
    return NextResponse.json(
      {error: 'entityId is required and must be a positive integer'},
      {status: 400}
    );
  }

  try {
    const item = await addWatchlistItem(watchlistId, entityType as string, entityId);
    return NextResponse.json(item, {status: 201});
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        {error: 'Item already exists in this watchlist'},
        {status: 409}
      );
    }
    throw error;
  }
}

// ── DELETE ───────────────────────────────────────────────────

export async function DELETE(
  request: Request,
  {params}: {params: Promise<{id: string}>}
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const {id: idStr} = await params;
  const watchlistId = Number(idStr);

  if (!Number.isInteger(watchlistId) || watchlistId <= 0) {
    return NextResponse.json(
      {error: 'Invalid watchlist ID'},
      {status: 400}
    );
  }

  // Ensure watchlist belongs to user
  const watchlist = await prisma.watchlist.findUnique({where: {id: watchlistId}});
  if (!watchlist || watchlist.userId !== session.user.id) {
    return NextResponse.json(
      {error: 'Watchlist not found'},
      {status: 404}
    );
  }

  const {searchParams} = new URL(request.url);
  const entityType = searchParams.get('entityType');
  const entityIdStr = searchParams.get('entityId');

  if (!entityType || !VALID_ENTITY_TYPES.includes(entityType as typeof VALID_ENTITY_TYPES[number])) {
    return NextResponse.json(
      {error: `entityType is required and must be one of: ${VALID_ENTITY_TYPES.join(', ')}`},
      {status: 400}
    );
  }

  const entityId = Number(entityIdStr);
  if (!Number.isInteger(entityId) || entityId <= 0) {
    return NextResponse.json(
      {error: 'entityId is required and must be a positive integer'},
      {status: 400}
    );
  }

  try {
    await removeWatchlistItem(watchlistId, entityType, entityId);
    return NextResponse.json({success: true});
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        {error: 'Item not found in watchlist'},
        {status: 404}
      );
    }
    throw error;
  }
}

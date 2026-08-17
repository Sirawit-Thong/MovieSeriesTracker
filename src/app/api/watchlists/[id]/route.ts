// Single Watchlist API Route
// GET    /api/watchlists/[id]  — get watchlist with items
// PUT    /api/watchlists/[id]  — update watchlist
// DELETE /api/watchlists/[id]  — delete watchlist and its items

import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/config';
import {
  getWatchlistWithItems,
  updateWatchlist,
  deleteWatchlist,
} from '@/lib/db/user-queries';

// ── GET ──────────────────────────────────────────────────────

export async function GET(
  _request: Request,
  {params}: {params: Promise<{id: string}>}
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const {id: idStr} = await params;
  const id = Number(idStr);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      {error: 'Invalid watchlist ID'},
      {status: 400}
    );
  }

  const watchlist = await getWatchlistWithItems(id);

  if (!watchlist || watchlist.userId !== session.user.id) {
    return NextResponse.json(
      {error: 'Watchlist not found'},
      {status: 404}
    );
  }

  return NextResponse.json(watchlist);
}

// ── PUT ──────────────────────────────────────────────────────

export async function PUT(
  request: Request,
  {params}: {params: Promise<{id: string}>}
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const {id: idStr} = await params;
  const id = Number(idStr);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      {error: 'Invalid watchlist ID'},
      {status: 400}
    );
  }

  // Ensure watchlist belongs to user
  const existing = await getWatchlistWithItems(id);
  if (!existing || existing.userId !== session.user.id) {
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

  const {name, description} = body;

  // At least one field must be provided
  if (name === undefined && description === undefined) {
    return NextResponse.json(
      {error: 'At least one of name or description must be provided'},
      {status: 400}
    );
  }

  const updateData: Record<string, unknown> = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        {error: 'name must be a non-empty string'},
        {status: 400}
      );
    }
    updateData.name = name.trim();
  }

  if (description !== undefined) {
    if (description !== null && typeof description !== 'string') {
      return NextResponse.json(
        {error: 'description must be a string or null'},
        {status: 400}
      );
    }
    updateData.description = description ? String(description) : null;
  }

  try {
    const updated = await updateWatchlist(id, updateData);
    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        {error: 'Watchlist not found'},
        {status: 404}
      );
    }
    throw error;
  }
}

// ── DELETE ───────────────────────────────────────────────────

export async function DELETE(
  _request: Request,
  {params}: {params: Promise<{id: string}>}
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const {id: idStr} = await params;
  const id = Number(idStr);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      {error: 'Invalid watchlist ID'},
      {status: 400}
    );
  }

  // Ensure watchlist belongs to user
  const existing = await getWatchlistWithItems(id);
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json(
      {error: 'Watchlist not found'},
      {status: 404}
    );
  }

  try {
    await deleteWatchlist(id);
    return NextResponse.json({success: true});
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        {error: 'Watchlist not found'},
        {status: 404}
      );
    }
    throw error;
  }
}

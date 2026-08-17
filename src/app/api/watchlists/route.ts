// Watchlists API Route
// GET  /api/watchlists  — list all watchlists with item counts
// POST /api/watchlists  — create a new watchlist

import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/config';
import {getWatchlists, createWatchlist} from '@/lib/db/user-queries';

// ── GET ──────────────────────────────────────────────────────

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const watchlists = await getWatchlists(session.user.id);

  // Transform _count to itemCount for cleaner API shape
  const result = watchlists.map(({_count, ...watchlist}) => ({
    ...watchlist,
    itemCount: _count.items,
  }));

  return NextResponse.json(result);
}

// ── POST ─────────────────────────────────────────────────────

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({error: 'Invalid JSON body'}, {status: 400});
  }

  const {name, description} = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json(
      {error: 'name is required and must be a non-empty string'},
      {status: 400}
    );
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    return NextResponse.json(
      {error: 'description must be a string or null'},
      {status: 400}
    );
  }

  const watchlist = await createWatchlist(session.user.id, {
    name: name.trim(),
    description: description ? String(description) : null,
  });

  return NextResponse.json(watchlist, {status: 201});
}

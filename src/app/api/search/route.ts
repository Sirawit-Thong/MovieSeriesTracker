// Search API Route
// GET /api/search?q=query — Full-text search across movies, TV series, and persons.

import {NextResponse} from 'next/server';
import {searchAll} from '@/lib/db/search';

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query) {
    return NextResponse.json(
      {error: 'Query parameter "q" is required'},
      {status: 400}
    );
  }

  const results = await searchAll(query);

  return NextResponse.json(results);
}

import {NextResponse} from 'next/server';
import {fetchOnMiss} from '@/lib/ingestion/on-demand';

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const tmdbId = Number(searchParams.get('tmdbId'));
  const entity = searchParams.get('entity') || 'movie';

  if (isNaN(tmdbId)) {
    return NextResponse.json({error: 'tmdbId is required'}, {status: 400});
  }

  const result = await fetchOnMiss(entity as 'movie' | 'tv' | 'person', tmdbId);
  return NextResponse.json({result});
}

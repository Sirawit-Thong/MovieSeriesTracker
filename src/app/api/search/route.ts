// Search API Route
// GET /api/search?q=query — Full-text search across local DB + TMDB.

import {NextResponse} from 'next/server';
import {searchAll} from '@/lib/db/search';
import {TmdbClient} from '@/lib/tmdb/client';
import type {TmdbMultiSearchResult} from '@/lib/tmdb/types';

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query) {
    return NextResponse.json(
      {error: 'Query parameter "q" is required'},
      {status: 400}
    );
  }

  // Run local DB search and TMDB multi-search in parallel
  const tmdbClient = new TmdbClient({language: 'en-US'});

  const [localResults, tmdbResults] = await Promise.all([
    searchAll(query),
    tmdbClient.searchMulti({query, page: 1}).catch((error) => {
      console.error('[search] TMDB multi-search failed:', error);
      return null;
    }),
  ]);

  // Build set of TMDB IDs already in local results (for dedup)
  const localMovieTmdbIds = new Set(localResults.movies.map((m) => m.id));
  const localTvTmdbIds = new Set(localResults.tvSeries.map((s) => s.id));
  const localPersonIds = new Set(localResults.persons.map((p) => p.id));

  // Extract TMDB-only results (not already in local DB)
  const tmdbOnlyMovies: Array<{
    id: number;
    tmdbId: number;
    title: string;
    posterPath: string | null;
    voteAverage: number | null;
    releaseDate: string | null;
    overview: string | null;
    source: 'tmdb';
  }> = [];

  const tmdbOnlyTv: Array<{
    id: number;
    tmdbId: number;
    name: string;
    posterPath: string | null;
    voteAverage: number | null;
    firstAirDate: string | null;
    overview: string | null;
    source: 'tmdb';
  }> = [];

  const tmdbOnlyPersons: Array<{
    id: number;
    tmdbId: number;
    name: string;
    profilePath: string | null;
    popularity: number | null;
    knownForDepartment: string | null;
    source: 'tmdb';
  }> = [];

  if (tmdbResults?.results) {
    // Filter to movies, TV, and persons; deduplicate against local results
    const seenMovieTmdbIds = new Set<number>();
    const seenTvTmdbIds = new Set<number>();
    const seenPersonTmdbIds = new Set<number>();

    for (const item of tmdbResults.results) {
      const tmdbItem = item as TmdbMultiSearchResult;

      if (tmdbItem.media_type === 'movie' && tmdbItem.id) {
        // Skip if already in local DB or already added
        if (localMovieTmdbIds.has(tmdbItem.id) || seenMovieTmdbIds.has(tmdbItem.id)) continue;
        seenMovieTmdbIds.add(tmdbItem.id);

        tmdbOnlyMovies.push({
          id: tmdbItem.id,
          tmdbId: tmdbItem.id,
          title: tmdbItem.title || 'Unknown',
          posterPath: tmdbItem.poster_path || tmdbItem.backdrop_path || null,
          voteAverage: tmdbItem.vote_average || null,
          releaseDate: tmdbItem.release_date || null,
          overview: tmdbItem.overview || null,
          source: 'tmdb',
        });
      } else if (tmdbItem.media_type === 'tv' && tmdbItem.id) {
        if (localTvTmdbIds.has(tmdbItem.id) || seenTvTmdbIds.has(tmdbItem.id)) continue;
        seenTvTmdbIds.add(tmdbItem.id);

        tmdbOnlyTv.push({
          id: tmdbItem.id,
          tmdbId: tmdbItem.id,
          name: tmdbItem.name || 'Unknown',
          posterPath: tmdbItem.poster_path || tmdbItem.backdrop_path || null,
          voteAverage: tmdbItem.vote_average || null,
          firstAirDate: tmdbItem.first_air_date || null,
          overview: tmdbItem.overview || null,
          source: 'tmdb',
        });
      } else if (tmdbItem.media_type === 'person' && tmdbItem.id) {
        if (localPersonIds.has(tmdbItem.id) || seenPersonTmdbIds.has(tmdbItem.id)) continue;
        seenPersonTmdbIds.add(tmdbItem.id);

        tmdbOnlyPersons.push({
          id: tmdbItem.id,
          tmdbId: tmdbItem.id,
          name: tmdbItem.name || 'Unknown',
          profilePath: tmdbItem.profile_path || null,
          popularity: tmdbItem.popularity || null,
          knownForDepartment: tmdbItem.known_for_department || null,
          source: 'tmdb',
        });
      }
    }
  }

  return NextResponse.json({
    movies: [
      ...localResults.movies.map((m) => ({...m, source: 'db' as const})),
      ...tmdbOnlyMovies,
    ],
    tvSeries: [
      ...localResults.tvSeries.map((s) => ({...s, source: 'db' as const})),
      ...tmdbOnlyTv,
    ],
    persons: [
      ...localResults.persons.map((p) => ({...p, source: 'db' as const})),
      ...tmdbOnlyPersons,
    ],
  });
}

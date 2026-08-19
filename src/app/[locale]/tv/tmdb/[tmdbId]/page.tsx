import {redirect, notFound} from 'next/navigation';
import {fetchOnMiss} from '@/lib/ingestion/on-demand';

type TmdbTvPageProps = {
  params: Promise<{locale: string; tmdbId: string}>;
};

/**
 * On-demand TV series lookup by TMDB ID.
 * Fetches series data from TMDB if not in DB, then redirects to canonical URL.
 */
export default async function TmdbTvPage({params}: TmdbTvPageProps) {
  const {locale, tmdbId} = await params;
  const tmdbIdNum = Number(tmdbId);

  if (!Number.isInteger(tmdbIdNum)) {
    notFound();
  }

  const result = await fetchOnMiss('tv', tmdbIdNum);

  if (!result) {
    notFound();
  }

  redirect(`/${locale}/tv/${result.tmdbId}`);
}

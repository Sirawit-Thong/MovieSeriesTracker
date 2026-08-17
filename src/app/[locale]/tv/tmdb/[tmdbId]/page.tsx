import {redirect} from 'next/navigation';
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

  if (isNaN(tmdbIdNum)) {
    redirect(`/${locale}`);
  }

  const result = await fetchOnMiss('tv', tmdbIdNum);

  if (!result) {
    redirect(`/${locale}`);
  }

  redirect(`/${locale}/tv/${result.dbId}`);
}

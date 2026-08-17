import {redirect} from 'next/navigation';
import {fetchOnMiss} from '@/lib/ingestion/on-demand';

type TmdbPersonPageProps = {
  params: Promise<{locale: string; tmdbId: string}>;
};

/**
 * On-demand person lookup by TMDB ID.
 * Fetches person data from TMDB if not in DB, then redirects to canonical URL.
 */
export default async function TmdbPersonPage({params}: TmdbPersonPageProps) {
  const {locale, tmdbId} = await params;
  const tmdbIdNum = Number(tmdbId);

  if (isNaN(tmdbIdNum)) {
    redirect(`/${locale}`);
  }

  const result = await fetchOnMiss('person', tmdbIdNum);

  if (!result) {
    redirect(`/${locale}`);
  }

  redirect(`/${locale}/person/${result.dbId}`);
}

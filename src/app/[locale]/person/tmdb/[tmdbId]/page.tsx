import {redirect, notFound} from 'next/navigation';
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

  if (!Number.isInteger(tmdbIdNum)) {
    notFound();
  }

  const result = await fetchOnMiss('person', tmdbIdNum);

  if (!result) {
    notFound();
  }

  redirect(`/${locale}/person/${result.tmdbId}`);
}

import {redirect, notFound} from 'next/navigation';
import {fetchOnMiss} from '@/lib/ingestion/on-demand';

type TmdbMoviePageProps = {
  params: Promise<{locale: string; tmdbId: string}>;
};

export default async function TmdbMoviePage({params}: TmdbMoviePageProps) {
  const {locale, tmdbId} = await params;
  const tmdbIdNum = Number(tmdbId);

  if (isNaN(tmdbIdNum)) {
    notFound();
  }

  const result = await fetchOnMiss('movie', tmdbIdNum);

  if (!result) {
    notFound();
  }

  redirect(`/${locale}/movie/${result.dbId}`);
}

import {setRequestLocale} from 'next-intl/server';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import MediaSection from '@/components/media/MediaSection';
import {
  getTrendingMovies,
  getTrendingTvSeries,
  getPopularMovies,
  getPopularTvSeries,
  getTopRatedMovies,
  getTopRatedTvSeries,
  type MediaItem,
} from '@/lib/db/media-queries';

const SECTION_LIMIT = 20;

export const dynamic = 'force-dynamic';

function toMediaItem(tv: {id: number; name: string; posterPath: string | null; backdropPath: string | null; voteAverage: number | null; overview: string | null}): MediaItem {
  return {
    id: tv.id,
    title: tv.name,
    posterPath: tv.posterPath,
    backdropPath: tv.backdropPath,
    voteAverage: tv.voteAverage,
    overview: tv.overview,
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  // Fetch all media data in parallel
  const [
    trendingMovies,
    trendingTv,
    popularMovies,
    popularTv,
    topRatedMovies,
    topRatedTv,
  ] = await Promise.all([
    getTrendingMovies(SECTION_LIMIT),
    getTrendingTvSeries(SECTION_LIMIT),
    getPopularMovies(SECTION_LIMIT),
    getPopularTvSeries(SECTION_LIMIT),
    getTopRatedMovies(SECTION_LIMIT),
    getTopRatedTvSeries(SECTION_LIMIT),
  ]);

  return (
    <HomePageContent
      locale={locale}
      trendingMovies={trendingMovies}
      trendingTv={trendingTv.map(toMediaItem)}
      popularMovies={popularMovies}
      popularTv={popularTv.map(toMediaItem)}
      topRatedMovies={topRatedMovies}
      topRatedTv={topRatedTv.map(toMediaItem)}
    />
  );
}

type TvMediaItem = {
  id: number;
  name: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number | null;
  overview: string | null;
};

type HomePageContentProps = {
  locale: string;
  trendingMovies: MediaItem[];
  trendingTv: MediaItem[];
  popularMovies: MediaItem[];
  popularTv: MediaItem[];
  topRatedMovies: MediaItem[];
  topRatedTv: MediaItem[];
};

function HomePageContent({
  locale,
  trendingMovies,
  trendingTv,
  popularMovies,
  popularTv,
  topRatedMovies,
  topRatedTv,
}: HomePageContentProps) {
  const t = useTranslations('Home');
  const tNav = useTranslations('Navigation');

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          {t('title')}
        </h1>
        <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mb-8">
          {t('subtitle')}
        </p>
        <div className="flex gap-4">
          <Link
            href="/movies"
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors"
          >
            {tNav('movies')}
          </Link>
          <Link
            href="/tv-series"
            className="px-6 py-3 bg-surface hover:bg-surface-hover text-foreground font-medium rounded-lg border border-border transition-colors"
          >
            {tNav('tvSeries')}
          </Link>
        </div>
      </section>

      {/* Trending Movies — horizontal scroll */}
      <MediaSection
        title={t('trendingMovies')}
        items={trendingMovies}
        type="movie"
        locale={locale}
        horizontal
      />

      {/* Trending TV Series — horizontal scroll */}
      <MediaSection
        title={t('trendingTv')}
        items={trendingTv}
        type="tv"
        locale={locale}
        horizontal
      />

      {/* Popular Movies — grid */}
      <MediaSection
        title={t('popularMovies')}
        items={popularMovies}
        type="movie"
        locale={locale}
      />

      {/* Popular TV Series — grid */}
      <MediaSection
        title={t('popularTv')}
        items={popularTv}
        type="tv"
        locale={locale}
      />

      {/* Top Rated Movies — grid */}
      <MediaSection
        title={t('topRatedMovies')}
        items={topRatedMovies}
        type="movie"
        locale={locale}
      />

      {/* Top Rated TV Series — grid */}
      <MediaSection
        title={t('topRatedTv')}
        items={topRatedTv}
        type="tv"
        locale={locale}
      />
    </div>
  );
}

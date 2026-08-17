import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {prisma} from '@/lib/db';
import MovieDetail from '@/components/movie/MovieDetail';
import {getLocalizedField} from '@/lib/ingestion/translation-sync';

type MoviePageProps = {
  params: Promise<{locale: string; id: string}>;
};

/**
 * Fetch a movie by its TMDB ID with all related data.
 * Includes direct relations and polymorphic sub-resources.
 * Returns null if no movie is found.
 */
async function getMovieById(id: number, locale: string) {
  const movie = await prisma.movie.findUnique({
    where: {tmdbId: id},
    include: {
      genres: {include: {genre: true}},
      productionCompanies: {include: {company: true}},
      productionCountries: {include: {country: true}},
      spokenLanguages: {include: {language: true}},
      collection: true,
      castCredits: {
        include: {person: true},
        orderBy: {order: 'asc'},
      },
      crewCredits: {
        include: {person: true},
      },
      // Sub-resources: direct relations
      watchProviders: {include: {provider: true}},
      releaseDates: true,
      contentRatings: true,
      altTitles: true,
    },
  });

  if (!movie) return null;

  // Sub-resources: polymorphic tables (use movie.id = DB PK)
  const [images, videos, externalIds, translations, recommendations] =
    await Promise.all([
      prisma.mediaImage.findMany({
        where: {entityType: 'movie', entityId: movie.id},
        orderBy: {voteAverage: 'desc'},
      }),
      prisma.mediaVideo.findMany({
        where: {entityType: 'movie', entityId: movie.id},
      }),
      prisma.externalId.findFirst({
        where: {entityType: 'movie', entityId: movie.id},
      }),
      prisma.translation.findMany({
        where: {entityType: 'movie', entityId: movie.id},
      }),
      prisma.recommendation.findMany({
        where: {sourceType: 'movie', sourceId: movie.id},
        orderBy: {position: 'asc'},
      }),
    ]);

  // Look up recommended movie/TV targets
  const recMovieIds = recommendations
    .filter((r) => r.targetType === 'movie')
    .map((r) => r.targetId);
  const recTvIds = recommendations
    .filter((r) => r.targetType === 'tv')
    .map((r) => r.targetId);

  const [recMovies, recTv] = await Promise.all([
    recMovieIds.length > 0
      ? prisma.movie.findMany({
          where: {id: {in: recMovieIds}},
          select: {
            id: true,
            tmdbId: true,
            title: true,
            posterPath: true,
            backdropPath: true,
            voteAverage: true,
          },
        })
      : [],
    recTvIds.length > 0
      ? prisma.tvSeries.findMany({
          where: {id: {in: recTvIds}},
          select: {
            id: true,
            tmdbId: true,
            name: true,
            posterPath: true,
            backdropPath: true,
            voteAverage: true,
          },
        })
      : [],
  ]);

  return {
    ...movie,
    images,
    videos,
    externalIds,
    translations,
    recommendations: [
      ...recMovies.map((m) => ({
        ...m,
        title: m.title,
        mediaType: 'movie' as const,
      })),
      ...recTv.map((tv) => ({
        id: tv.id,
        tmdbId: tv.tmdbId,
        title: tv.name,
        posterPath: tv.posterPath,
        backdropPath: tv.backdropPath,
        voteAverage: tv.voteAverage,
        mediaType: 'tv' as const,
      })),
    ],
    localized: {
      title: getLocalizedField(translations, locale, 'title', movie.title),
      overview: getLocalizedField(translations, locale, 'overview', movie.overview),
      tagline: getLocalizedField(translations, locale, 'tagline', movie.tagline),
    },
  };
}

export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  const {locale, id} = await params;
  const movie = await getMovieById(Number(id), locale);

  if (!movie) {
    return {title: 'Movie Not Found'};
  }

  const title = movie.localized?.title ?? movie.title;
  const overview = movie.localized?.overview ?? movie.overview;

  return {
    title: `${title} | Movie Series Tracker`,
    description: overview?.slice(0, 160) ?? title,
    openGraph: {
      title,
      description: overview ?? undefined,
      images: movie.backdropPath
        ? [`https://image.tmdb.org/t/p/w1280${movie.backdropPath}`]
        : undefined,
    },
  };
}

export default async function MoviePage({params}: MoviePageProps) {
  const {locale, id} = await params;
  setRequestLocale(locale);

  const movie = await getMovieById(Number(id), locale);

  if (!movie) {
    notFound();
  }

  return <MovieDetail movie={movie} locale={locale} />;
}

import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {prisma} from '@/lib/db';
import TvDetail from '@/components/tv/TvDetail';

type TvPageProps = {
  params: Promise<{locale: string; id: string}>;
};

/**
 * Fetch a TV series by its database ID with all related data.
 * Includes direct relations and polymorphic sub-resources.
 * Returns null if no series is found.
 */
async function getTvSeriesById(id: number) {
  const series = await prisma.tvSeries.findUnique({
    where: {id},
    include: {
      genres: {include: {genre: true}},
      networks: {include: {network: true}},
      productionCompanies: {include: {company: true}},
      productionCountries: {include: {country: true}},
      spokenLanguages: {include: {language: true}},
      createdBy: true,
      seasons: {
        include: {
          episodes: {
            orderBy: {episodeNumber: 'asc'},
          },
        },
        orderBy: {seasonNumber: 'asc'},
      },
      nextEpisodeToAir: true,
      lastEpisodeToAir: true,
      castCredits: {
        include: {person: true},
        orderBy: {order: 'asc'},
      },
      crewCredits: {
        include: {person: true},
      },
      // Sub-resources: direct relations
      watchProviders: {include: {provider: true}},
      contentRatings: true,
      altTitles: true,
    },
  });

  if (!series) return null;

  // Sub-resources: polymorphic tables
  const [images, videos, externalIds, translations, recommendations] =
    await Promise.all([
      prisma.mediaImage.findMany({
        where: {entityType: 'tv', entityId: id},
        orderBy: {voteAverage: 'desc'},
      }),
      prisma.mediaVideo.findMany({
        where: {entityType: 'tv', entityId: id},
      }),
      prisma.externalId.findFirst({
        where: {entityType: 'tv', entityId: id},
      }),
      prisma.translation.findMany({
        where: {entityType: 'tv', entityId: id},
      }),
      prisma.recommendation.findMany({
        where: {sourceType: 'tv', sourceId: id},
        orderBy: {position: 'asc'},
      }),
    ]);

  // Look up recommended targets
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
    ...series,
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
  };
}

export async function generateMetadata({
  params,
}: TvPageProps): Promise<Metadata> {
  const {id} = await params;
  const series = await getTvSeriesById(Number(id));

  if (!series) {
    return {title: 'TV Series Not Found'};
  }

  return {
    title: `${series.name} | Movie Series Tracker`,
    description: series.overview?.slice(0, 160) ?? series.name,
    openGraph: {
      title: series.name,
      description: series.overview ?? undefined,
      images: series.backdropPath
        ? [`https://image.tmdb.org/t/p/w1280${series.backdropPath}`]
        : undefined,
    },
  };
}

export default async function TvPage({params}: TvPageProps) {
  const {locale, id} = await params;
  setRequestLocale(locale);

  const series = await getTvSeriesById(Number(id));

  if (!series) {
    notFound();
  }

  return <TvDetail series={series} locale={locale} />;
}

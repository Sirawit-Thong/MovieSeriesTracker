import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {cache} from 'react';
import {setRequestLocale} from 'next-intl/server';
import {prisma} from '@/lib/db';
import TvDetail from '@/components/tv/TvDetail';
import {getLocalizedField} from '@/lib/ingestion/translation-sync';
import {ensureMediaCredits} from '@/lib/ingestion/media-credit-sync';
import {resolveLocalizedTitles} from '@/lib/db/resolve-localized-titles';

type TvPageProps = {
  params: Promise<{locale: string; id: string}>;
};

/**
 * Fetch a TV series by its TMDB ID with all related data.
 * Includes direct relations and polymorphic sub-resources.
 * Returns null if no series is found.
 */
const getTvSeriesById = cache(async function getTvSeriesById(id: number, locale: string) {
  const series = await prisma.tvSeries.findUnique({
    where: {tmdbId: id},
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

  // Ensure cast/crew credits exist — sync from TMDB if empty
  const hasCredits = series.castCredits.length > 0 || series.crewCredits.length > 0;
  if (!hasCredits) {
    await ensureMediaCredits('tv', series.id, id);
    const [castCredits, crewCredits] = await Promise.all([
      prisma.castCredit.findMany({
        where: {tvSeriesId: series.id},
        include: {person: true},
        orderBy: {order: 'asc'},
      }),
      prisma.crewCredit.findMany({
        where: {tvSeriesId: series.id},
        include: {person: true},
      }),
    ]);
    series.castCredits = castCredits;
    series.crewCredits = crewCredits;
  }

  // Sub-resources: polymorphic tables (use series.id = DB PK)
  const [images, videos, externalIds, translations, recommendations] =
    await Promise.all([
      prisma.mediaImage.findMany({
        where: {entityType: 'tv', entityId: series.id},
        orderBy: {voteAverage: 'desc'},
      }),
      prisma.mediaVideo.findMany({
        where: {entityType: 'tv', entityId: series.id},
      }),
      prisma.externalId.findFirst({
        where: {entityType: 'tv', entityId: series.id},
      }),
      prisma.translation.findMany({
        where: {entityType: 'tv', entityId: series.id},
      }),
      prisma.recommendation.findMany({
        where: {sourceType: 'tv', sourceId: series.id},
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
            releaseDate: true,
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
            firstAirDate: true,
          },
        })
      : [],
  ]);

  // Resolve localized titles for recommendations
  const recLocalizedTitles = await resolveLocalizedTitles(locale, [
    ...recMovies.map((m) => ({tmdbId: m.tmdbId, type: 'movie' as const})),
    ...recTv.map((t) => ({tmdbId: t.tmdbId, type: 'tv' as const})),
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
        title: recLocalizedTitles[m.tmdbId] || m.title,
        mediaType: 'movie' as const,
      })),
      ...recTv.map((tv) => ({
        id: tv.id,
        tmdbId: tv.tmdbId,
        title: recLocalizedTitles[tv.tmdbId] || tv.name,
        posterPath: tv.posterPath,
        backdropPath: tv.backdropPath,
        voteAverage: tv.voteAverage,
        releaseDate: tv.firstAirDate,
        mediaType: 'tv' as const,
      })),
    ],
    localized: {
      name: getLocalizedField(translations, locale, 'name', series.name),
      overview: getLocalizedField(translations, locale, 'overview', series.overview),
      tagline: getLocalizedField(translations, locale, 'tagline', series.tagline),
    },
  };
});

export async function generateMetadata({
  params,
}: TvPageProps): Promise<Metadata> {
  const {locale, id} = await params;
  const series = await getTvSeriesById(Number(id), locale);

  if (!series) {
    return {title: 'TV Series Not Found'};
  }

  const name = series.localized?.name ?? series.name;
  const overview = series.localized?.overview ?? series.overview;

  return {
    title: `${name} | Movie Series Tracker`,
    description: overview?.slice(0, 160) ?? name,
    openGraph: {
      title: name,
      description: overview ?? undefined,
      images: series.backdropPath
        ? [`https://image.tmdb.org/t/p/w1280${series.backdropPath}`]
        : undefined,
    },
  };
}

export default async function TvPage({params}: TvPageProps) {
  const {locale, id} = await params;
  setRequestLocale(locale);

  const series = await getTvSeriesById(Number(id), locale);

  if (!series) {
    notFound();
  }

  return <TvDetail series={series} locale={locale} />;
}

'use client';

import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import MovieInfo from './MovieInfo';
import CastList from '@/components/media/CastList';
import WatchProviders from '@/components/media/WatchProviders';
import MediaGallery from '@/components/media/MediaGallery';
import VideoList from '@/components/media/VideoList';
import ExternalLinks from '@/components/media/ExternalLinks';
import RecommendationList from '@/components/media/RecommendationList';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/** Release date type labels (TMDB standard). */
const RELEASE_TYPE_LABELS: Record<number, string> = {
  1: 'Premiere',
  2: 'Theatrical (limited)',
  3: 'Theatrical',
  4: 'Digital',
  5: 'Physical',
  6: 'TV',
};

/** Union of all Prisma relation types included by the page query. */
type MovieWithRelations = {
  id: number;
  tmdbId: number;
  title: string;
  originalTitle: string;
  tagline: string | null;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number | null;
  voteCount: number | null;
  popularity: number | null;
  releaseDate: Date | null;
  runtime: number | null;
  status: string | null;
  budget: number | null;
  revenue: number | null;
  homepage: string | null;
  imdbId: string | null;
  originalLanguage: string;
  video: boolean;
  adult: boolean;
  genres: Array<{genre: {id: number; name: string}}>;
  productionCompanies: Array<{
    company: {id: number; name: string; logoPath: string; originCountry: string};
  }>;
  productionCountries: Array<{country: {iso31661: string; name: string}}>;
  spokenLanguages: Array<{
    language: {englishName: string; iso6391: string; name: string};
  }>;
  collection: {id: number; name: string; posterPath: string | null; backdropPath: string | null} | null;
  castCredits: Array<{
    id: number;
    character: string | null;
    order: number | null;
    person: {id: number; tmdbId: number; name: string; profilePath: string | null};
  }>;
  crewCredits: Array<{
    id: number;
    department: string | null;
    job: string | null;
    person: {id: number; tmdbId: number; name: string; profilePath: string | null};
  }>;
  // Sub-resources
  watchProviders: Array<{
    providerId: number;
    providerType: string | null;
    provider: {providerId: number; providerName: string; logoPath: string; displayPriority: number};
  }>;
  releaseDates: Array<{
    id: number;
    countryCode: string;
    certification: string | null;
    releaseDate: string;
    type: number;
    descriptors: string | null;
  }>;
  contentRatings: Array<{
    id: number;
    countryCode: string;
    rating: string;
  }>;
  altTitles: Array<{
    id: number;
    countryCode: string;
    title: string;
    type: string | null;
  }>;
  images: Array<{
    id: number;
    filePath: string;
    aspectRatio: number | null;
    width: number | null;
    height: number | null;
    imageType: string | null;
    voteAverage: number | null;
    language: string | null;
  }>;
  videos: Array<{
    id: number;
    key: string;
    name: string;
    site: string;
    type: string | null;
    language: string | null;
    official: boolean | null;
  }>;
  externalIds: {
    imdbId: string | null;
    facebookId: string | null;
    instagramId: string | null;
    twitterId: string | null;
    tiktokId: string | null;
    youtubeId: string | null;
    wikidataId: string | null;
    tvdbId: number | null;
  } | null;
  translations: Array<{
    id: number;
    iso6391: string;
    iso31661: string;
    name: string;
    englishName: string | null;
    data: string | null;
  }>;
  recommendations: Array<{
    id: number;
    tmdbId: number;
    title: string;
    posterPath: string | null;
    backdropPath: string | null;
    voteAverage: number | null;
    mediaType: 'movie' | 'tv';
  }>;
};

type MovieDetailProps = {
  movie: MovieWithRelations;
  locale: string;
};

/** Format a number as USD currency. */
function formatCurrency(value: number | null): string {
  if (!value || value === 0) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format runtime minutes into "Xh Ym". */
function formatRuntime(minutes: number | null): string {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/** Format a date string to a locale-friendly display. */
function formatDate(date: Date | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Movie detail page — hero section with backdrop/poster, metadata, and cast/crew.
 * Extended with watch providers, release dates, content ratings, alternative titles,
 * translations, images, videos, external links, and recommendations.
 */
export default function MovieDetail({movie, locale}: MovieDetailProps) {
  const t = useTranslations('Movie');

  const backdropSrc = movie.backdropPath
    ? `${TMDB_IMAGE_BASE}/w1280${movie.backdropPath}`
    : null;
  const posterSrc = movie.posterPath
    ? `${TMDB_IMAGE_BASE}/w500${movie.posterPath}`
    : null;
  const rating = movie.voteAverage !== null ? movie.voteAverage.toFixed(1) : null;

  const genres = movie.genres.map((g) => g.genre);
  const companies = movie.productionCompanies.map((pc) => pc.company);
  const countries = movie.productionCountries.map((pc) => pc.country);
  const languages = movie.spokenLanguages.map((sl) => sl.language);
  const cast = movie.castCredits;
  const crew = movie.crewCredits;

  // Group release dates by country
  const releaseDatesByCountry = movie.releaseDates.reduce<Record<string, typeof movie.releaseDates>>(
    (acc, rd) => {
      if (!acc[rd.countryCode]) acc[rd.countryCode] = [];
      acc[rd.countryCode].push(rd);
      return acc;
    },
    {}
  );

  // Group content ratings by country
  const contentRatingsByCountry = movie.contentRatings.reduce<Record<string, string>>(
    (acc, cr) => {
      acc[cr.countryCode] = cr.rating;
      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen">
      {/* ─── Hero Section ─────────────────────────────────── */}
      <section className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden">
        {/* Backdrop image */}
        {backdropSrc ? (
          <Image
            src={backdropSrc}
            alt={movie.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
        ) : (
          <div className="w-full h-full bg-surface" />
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />

        {/* Poster + Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 flex gap-4 md:gap-8 max-w-7xl mx-auto">
          {/* Poster */}
          {posterSrc && (
            <div className="relative flex-shrink-0 w-[120px] md:w-[200px] aspect-[2/3] rounded-lg overflow-hidden shadow-2xl border border-white/10">
              <Image
                src={posterSrc}
                alt={movie.title}
                fill
                priority
                sizes="(max-width: 768px) 120px, 200px"
                className="object-cover"
              />
            </div>
          )}

          {/* Title block */}
          <div className="flex flex-col justify-end pb-2 min-w-0">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              {movie.title}
            </h1>
            {movie.originalTitle !== movie.title && (
              <p className="text-sm md:text-base text-foreground/50 mt-1">
                {movie.originalTitle}
              </p>
            )}
            {movie.tagline && (
              <p className="text-sm md:text-base italic text-foreground/60 mt-2">
                &ldquo;{movie.tagline}&rdquo;
              </p>
            )}

            {/* Rating + Metadata row */}
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-foreground/70">
              {rating && (
                <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {rating}
                  {movie.voteCount !== null && (
                    <span className="text-xs text-foreground/40 font-normal">
                      ({movie.voteCount.toLocaleString()})
                    </span>
                  )}
                </span>
              )}
              {movie.releaseDate && (
                <span>{formatDate(movie.releaseDate)}</span>
              )}
              {movie.runtime && <span>{formatRuntime(movie.runtime)}</span>}
              {movie.status && (
                <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                  {movie.status}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Content ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: main content */}
          <div className="flex-1 min-w-0">
            {/* Overview */}
            {movie.overview && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('overview')}
                </h2>
                <p className="text-foreground/70 leading-relaxed whitespace-pre-line">
                  {movie.overview}
                </p>
              </div>
            )}

            {/* Watch Providers */}
            {movie.watchProviders.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('watchProviders')}
                </h2>
                <WatchProviders providers={movie.watchProviders} />
              </div>
            )}

            {/* Genres */}
            {genres.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('genres')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <Link
                      key={genre.id}
                      href={`/movies?genre=${genre.id}`}
                      className="px-3 py-1.5 text-sm bg-surface hover:bg-surface-hover border border-border rounded-full text-foreground/80 hover:text-white transition-colors"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {movie.videos.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('videos')}
                </h2>
                <VideoList videos={movie.videos} />
              </div>
            )}

            {/* Release Dates */}
            {movie.releaseDates.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('releaseDates')}
                </h2>
                <div className="bg-surface rounded-lg border border-border overflow-hidden">
                  <div className="divide-y divide-border">
                    {Object.entries(releaseDatesByCountry).map(([country, dates]) => (
                      <div key={country} className="px-4 py-3">
                        <h4 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">
                          {country}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {dates.map((rd) => (
                            <span
                              key={rd.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-background rounded border border-border text-foreground/70"
                            >
                              {rd.certification && (
                                <span className="font-semibold text-foreground/90">
                                  {rd.certification}
                                </span>
                              )}
                              <span>{rd.releaseDate}</span>
                              <span className="text-foreground/40">
                                ({RELEASE_TYPE_LABELS[rd.type] ?? `Type ${rd.type}`})
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Content Ratings */}
            {movie.contentRatings.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('contentRatings')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {movie.contentRatings.map((cr) => (
                    <div
                      key={cr.id}
                      className="flex items-center gap-2 bg-surface rounded-lg px-3 py-2 border border-border"
                    >
                      <span className="text-xs font-semibold text-foreground/50">
                        {cr.countryCode}
                      </span>
                      <span className="text-sm font-medium text-foreground/90">
                        {cr.rating}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alternative Titles */}
            {movie.altTitles.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('alternativeTitles')}
                </h2>
                <div className="bg-surface rounded-lg border border-border overflow-hidden">
                  <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
                    {movie.altTitles.map((at) => (
                      <div
                        key={at.id}
                        className="flex items-center justify-between px-4 py-2.5"
                      >
                        <span className="text-sm text-foreground/80">
                          {at.title}
                        </span>
                        <div className="flex items-center gap-2">
                          {at.type && (
                            <span className="text-[10px] text-foreground/40">
                              {at.type}
                            </span>
                          )}
                          <span className="text-xs font-mono text-foreground/50 bg-background px-1.5 py-0.5 rounded">
                            {at.countryCode}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Translations */}
            {movie.translations.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('translations')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {movie.translations.map((tr) => (
                    <div
                      key={tr.id}
                      className="px-3 py-1.5 text-sm bg-surface border border-border rounded-full text-foreground/70"
                    >
                      {tr.englishName ?? tr.name}
                      <span className="text-foreground/40 ml-1">
                        ({tr.iso6391})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Images */}
            {movie.images.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('images')} ({movie.images.length})
                </h2>
                <MediaGallery images={movie.images} />
              </div>
            )}

            {/* Budget & Revenue */}
            {(movie.budget && movie.budget > 0) ||
            (movie.revenue && movie.revenue > 0) ? (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('financial')}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface rounded-lg p-4 border border-border">
                    <span className="text-xs text-foreground/50 uppercase tracking-wider">
                      {t('budget')}
                    </span>
                    <p className="text-lg font-semibold text-foreground mt-1">
                      {formatCurrency(movie.budget)}
                    </p>
                  </div>
                  <div className="bg-surface rounded-lg p-4 border border-border">
                    <span className="text-xs text-foreground/50 uppercase tracking-wider">
                      {t('revenue')}
                    </span>
                    <p className="text-lg font-semibold text-foreground mt-1">
                      {formatCurrency(movie.revenue)}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Production Companies */}
            {companies.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('productionCompanies')}
                </h2>
                <div className="flex flex-wrap gap-4">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center gap-3 bg-surface rounded-lg px-4 py-3 border border-border"
                    >
                      {company.logoPath && (
                        <Image
                          src={`${TMDB_IMAGE_BASE}/w92${company.logoPath}`}
                          alt={company.name}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      )}
                      <span className="text-sm text-foreground/80">
                        {company.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Production Countries */}
            {countries.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('productionCountries')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {countries.map((country) => (
                    <span
                      key={country.iso31661}
                      className="px-3 py-1.5 text-sm bg-surface border border-border rounded-full text-foreground/70"
                    >
                      {country.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Spoken Languages */}
            {languages.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('spokenLanguages')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <span
                      key={lang.englishName}
                      className="px-3 py-1.5 text-sm bg-surface border border-border rounded-full text-foreground/70"
                    >
                      {lang.name}{' '}
                      <span className="text-foreground/40">
                        ({lang.englishName})
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Collection */}
            {movie.collection && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('collection')}
                </h2>
                <Link
                  href={`/movies?collection=${movie.collection.id}`}
                  className="flex items-center gap-4 bg-surface hover:bg-surface-hover rounded-lg p-4 border border-border transition-colors group"
                >
                  {movie.collection.posterPath && (
                    <div className="relative w-16 h-24 flex-shrink-0 rounded overflow-hidden">
                      <Image
                        src={`${TMDB_IMAGE_BASE}/w154${movie.collection.posterPath}`}
                        alt={movie.collection.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <span className="text-foreground/80 group-hover:text-white transition-colors font-medium">
                    {movie.collection.name}
                  </span>
                </Link>
              </div>
            )}

            {/* Cast */}
            {cast.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  {t('cast')}
                </h2>
                <CastList
                  items={cast.map((c) => ({
                    id: c.person.id,
                    tmdbId: c.person.tmdbId,
                    name: c.person.name,
                    profilePath: c.person.profilePath,
                    character: c.character ?? undefined,
                    order: c.order ?? undefined,
                  }))}
                />
              </div>
            )}

            {/* Crew */}
            {crew.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  {t('crew')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {crew.map((credit) => (
                    <Link
                      key={credit.id}
                      href={`/person/${credit.person.tmdbId}`}
                      className="flex items-center gap-3 bg-surface hover:bg-surface-hover rounded-lg p-3 border border-border transition-colors group"
                    >
                      <div className="relative w-10 h-10 flex-shrink-0 rounded-full overflow-hidden bg-muted">
                        {credit.person.profilePath ? (
                          <Image
                            src={`${TMDB_IMAGE_BASE}/w185${credit.person.profilePath}`}
                            alt={credit.person.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-foreground/40">
                            {credit.person.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground/90 group-hover:text-white truncate transition-colors">
                          {credit.person.name}
                        </p>
                        <p className="text-xs text-foreground/50 truncate">
                          {credit.job}
                          {credit.department ? ` · ${credit.department}` : ''}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {movie.recommendations.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  {t('recommendations')}
                </h2>
                <RecommendationList items={movie.recommendations} />
              </div>
            )}
          </div>

          {/* Right: sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <MovieInfo movie={movie} />

            {/* External Links */}
            <div className="mt-5 bg-surface rounded-lg border border-border p-6">
              <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">
                {t('externalLinks')}
              </h3>
              <ExternalLinks
                externalIds={movie.externalIds}
                tmdbId={movie.tmdbId}
                mediaType="movie"
                homepage={movie.homepage}
              />
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

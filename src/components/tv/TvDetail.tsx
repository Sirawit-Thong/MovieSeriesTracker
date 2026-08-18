'use client';

import TmdbImage from '@/components/ui/TmdbImage';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import CastList from '@/components/media/CastList';
import SeasonList from './SeasonList';
import WatchProviders from '@/components/media/WatchProviders';
import MediaGallery from '@/components/media/MediaGallery';
import VideoList from '@/components/media/VideoList';
import ExternalLinks from '@/components/media/ExternalLinks';
import RecommendationList from '@/components/media/RecommendationList';
import {translateJob, translateDepartment, translateStatus} from '@/lib/crew-translations';
import AddToLibraryButton from '@/components/library/AddToLibraryButton';
import SyncButton from '@/components/shared/SyncButton';
import AnnotationPanel from '@/components/user/AnnotationPanel';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/** Deduplicate an array of credits by person.id, keeping the first occurrence. */
function deduplicateByPersonId<T extends {person: {id: number}}>(items: T[]): T[] {
  const seen = new Set<number>();
  return items.filter((item) => {
    if (seen.has(item.person.id)) return false;
    seen.add(item.person.id);
    return true;
  });
}

/** Union of all Prisma relation types included by the page query. */
export type TvSeriesWithRelations = {
  id: number;
  tmdbId: number;
  name: string;
  originalName: string;
  tagline: string | null;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number | null;
  voteCount: number | null;
  popularity: number | null;
  firstAirDate: string | null;
  lastAirDate: string | null;
  status: string | null;
  type: string | null;
  inProduction: boolean | null;
  languages: string | null;
  originCountry: string | null;
  homepage: string | null;
  numberOfSeasons: number | null;
  numberOfEpisodes: number | null;
  adult: boolean;
  originalLanguage: string;
  createdBy: Array<{
    id: number;
    tmdbId: number;
    name: string;
    profilePath: string | null;
  }>;
  seasons: Array<{
    id: number;
    tmdbId: number;
    airDate: string | null;
    episodeCount: number | null;
    name: string;
    overview: string | null;
    posterPath: string | null;
    seasonNumber: number;
    voteAverage: number | null;
    episodes: Array<{
      id: number;
      tmdbId: number;
      airDate: string | null;
      episodeNumber: number;
      name: string;
      overview: string | null;
      stillPath: string | null;
      seasonNumber: number;
      voteAverage: number | null;
    }>;
  }>;
  genres: Array<{genre: {id: number; name: string}}>;
  networks: Array<{network: {id: number; name: string; logoPath: string; originCountry: string}}>;
  productionCompanies: Array<{
    company: {id: number; name: string; logoPath: string; originCountry: string};
  }>;
  productionCountries: Array<{country: {iso31661: string; name: string}}>;
  spokenLanguages: Array<{
    language: {englishName: string; iso6391: string; name: string};
  }>;
  nextEpisodeToAir: {
    id: number;
    name: string;
    airDate: string | null;
    episodeNumber: number;
    seasonNumber: number;
    overview: string | null;
    stillPath: string | null;
  } | null;
  lastEpisodeToAir: {
    id: number;
    name: string;
    airDate: string | null;
    episodeNumber: number;
    seasonNumber: number;
  } | null;
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
  contentRatings: Array<{
    id: number;
    countryCode: string;
    rating: string;
  }>;
  altTitles: Array<{
    id: number;
    countryCode: string;
    title: string;
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

type TvDetailProps = {
  series: TvSeriesWithRelations & {
    localized?: {
      name: string | null;
      overview: string | null;
      tagline: string | null;
    };
  };
  locale: string;
};

/** Format a date string to a locale-friendly display. */
function formatDate(dateStr: string | null, locale: string = 'en'): string {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

/** Reusable label/value row for the sidebar. */
function InfoRow({label, value}: {label: string; value: string}) {
  return (
    <div>
      <span className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1">
        {label}
      </span>
      <span className="text-sm text-foreground/90">{value}</span>
    </div>
  );
}

/**
 * TV Series detail page — hero section with backdrop/poster, metadata, seasons, and cast/crew.
 * Extended with watch providers, content ratings, alternative titles,
 * images, videos, external links, and recommendations.
 */
export default function TvDetail({series, locale}: TvDetailProps) {
  const t = useTranslations('Tv');

  const displayName = series.localized?.name ?? series.name;
  const displayOverview = series.localized?.overview ?? series.overview;
  const displayTagline = series.localized?.tagline ?? series.tagline;

  const backdropSrc = series.backdropPath
    ? `${TMDB_IMAGE_BASE}/w1280${series.backdropPath}`
    : null;
  const posterSrc = series.posterPath
    ? `${TMDB_IMAGE_BASE}/w500${series.posterPath}`
    : null;
  const rating = series.voteAverage !== null ? series.voteAverage.toFixed(1) : null;

  const genres = series.genres.map((g) => g.genre);
  const networks = series.networks.map((n) => n.network);
  const companies = series.productionCompanies.map((pc) => pc.company);
  const countries = series.productionCountries.map((pc) => pc.country);
  const languages = series.spokenLanguages.map((sl) => sl.language);
  const cast = deduplicateByPersonId(series.castCredits);
  const crew = deduplicateByPersonId(series.crewCredits);

  return (
    <div className="min-h-screen">
      {/* ─── Hero Section ─────────────────────────────────── */}
      <section className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden">
        {/* Backdrop image */}
        {backdropSrc ? (
<TmdbImage 
            src={backdropSrc}
            alt={displayName}
            fill
            fetchPriority="high"
            loading="eager"
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
    <TmdbImage 
                src={posterSrc}
                alt={displayName}
                fill
                fetchPriority="high"
                loading="eager"
                sizes="(max-width: 768px) 120px, 200px"
                className="object-cover"
              />
            </div>
          )}

          {/* Title block */}
          <div className="flex flex-col justify-end pb-2 min-w-0">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              {displayName}
            </h1>
            {series.originalName !== displayName && (
              <p className="text-sm md:text-base text-foreground/50 mt-1">
                {series.originalName}
              </p>
            )}
            {displayTagline && (
              <p className="text-sm md:text-base italic text-foreground/60 mt-2">
                &ldquo;{displayTagline}&rdquo;
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
                  {series.voteCount !== null && (
                    <span className="text-xs text-foreground/40 font-normal">
                      ({series.voteCount.toLocaleString()})
                    </span>
                  )}
                </span>
              )}
              {series.firstAirDate && (
                <span>{formatDate(series.firstAirDate, locale)}</span>
              )}
              {series.status && (
                <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                  {translateStatus(series.status, locale)}
                </span>
              )}
            </div>

            {/* Add to Library button */}
            <div className="mt-4 flex items-center gap-2">
              <AddToLibraryButton entityType="TV" entityId={series.id} />
              <SyncButton type="tv" tmdbId={series.tmdbId} />
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
            {displayOverview && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('overview')}
                </h2>
                <p className="text-foreground/70 leading-relaxed whitespace-pre-line">
                  {displayOverview}
                </p>
              </div>
            )}

            {/* Watch Providers */}
            {series.watchProviders.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('watchProviders')}
                </h2>
                <WatchProviders providers={series.watchProviders} />
              </div>
            )}

            {/* Next Episode to Air */}
            {series.nextEpisodeToAir && (
              <div className="mb-8 bg-surface/50 rounded-lg p-5 border border-primary/20">
                <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                  {t('nextEpisode')}
                </h2>
                <div className="flex gap-4">
                  {series.nextEpisodeToAir.stillPath && (
                    <div className="relative flex-shrink-0 w-[160px] aspect-video rounded overflow-hidden bg-muted">
            <TmdbImage 
                        src={`${TMDB_IMAGE_BASE}/w300${series.nextEpisodeToAir.stillPath}`}
                        alt={series.nextEpisodeToAir.name}
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-foreground/50">
                      S{series.nextEpisodeToAir.seasonNumber} E{series.nextEpisodeToAir.episodeNumber}
                    </p>
                    <h3 className="text-sm font-medium text-foreground/90">
                      {series.nextEpisodeToAir.name}
                    </h3>
                    {series.nextEpisodeToAir.airDate && (
                      <p className="text-xs text-foreground/40 mt-1">
                        {formatDate(series.nextEpisodeToAir.airDate, locale)}
                      </p>
                    )}
                    {series.nextEpisodeToAir.overview && (
                      <p className="text-xs text-foreground/60 mt-1.5 line-clamp-3">
                        {series.nextEpisodeToAir.overview}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Stats: Seasons, Episodes, Episode Runtime */}
            <div className="mb-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {series.numberOfSeasons !== null && (
                  <div className="bg-surface rounded-lg p-4 border border-border text-center">
                    <span className="text-2xl font-bold text-foreground/90">
                      {series.numberOfSeasons}
                    </span>
                    <p className="text-xs text-foreground/50 mt-1">
                      {t('seasons')}
                    </p>
                  </div>
                )}
                {series.numberOfEpisodes !== null && (
                  <div className="bg-surface rounded-lg p-4 border border-border text-center">
                    <span className="text-2xl font-bold text-foreground/90">
                      {series.numberOfEpisodes}
                    </span>
                    <p className="text-xs text-foreground/50 mt-1">
                      {t('episodes')}
                    </p>
                  </div>
                )}
                {series.inProduction !== null && (
                  <div className="bg-surface rounded-lg p-4 border border-border text-center">
                    <span
                      className={`text-2xl font-bold ${
                        series.inProduction ? 'text-green-400' : 'text-foreground/40'
                      }`}
                    >
                      {series.inProduction ? '●' : '○'}
                    </span>
                    <p className="text-xs text-foreground/50 mt-1">
                      {t('inProduction')}
                    </p>
                  </div>
                )}
              </div>
            </div>

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
                      href={`/tv?genre=${genre.id}`}
                      className="px-3 py-1.5 text-sm bg-surface hover:bg-surface-hover border border-border rounded-full text-foreground/80 hover:text-white transition-colors"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {series.videos.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('videos')}
                </h2>
                <VideoList videos={series.videos} />
              </div>
            )}

            {/* Created By */}
            {series.createdBy.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('createdBy')}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {series.createdBy.map((person) => (
                    <Link
                      key={person.id}
                      href={`/person/${person.tmdbId}`}
                      className="flex items-center gap-3 bg-surface hover:bg-surface-hover rounded-lg px-4 py-3 border border-border transition-colors group"
                    >
                      <div className="relative w-10 h-10 flex-shrink-0 rounded-full overflow-hidden bg-muted">
                        {person.profilePath ? (
                <TmdbImage 
                            src={`${TMDB_IMAGE_BASE}/w185${person.profilePath}`}
                            alt={person.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-foreground/40">
                            {person.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-foreground/80 group-hover:text-white transition-colors">
                        {person.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Networks */}
            {networks.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('networks')}
                </h2>
                <div className="flex flex-wrap gap-4">
                  {networks.map((network) => (
                    <div
                      key={network.id}
                      className="flex items-center gap-3 bg-surface rounded-lg px-4 py-3 border border-border"
                    >
                      {network.logoPath && (
              <TmdbImage 
                          src={`${TMDB_IMAGE_BASE}/w92${network.logoPath}`}
                          alt={network.name}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      )}
                      <span className="text-sm text-foreground/80">
                        {network.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Season List (expandable) */}
            {series.seasons.length > 0 && (
              <div className="mb-8">
                <SeasonList
                  seasons={series.seasons.map((s) => ({
                    ...s,
                    episodes: s.episodes ?? [],
                  }))}
                />
              </div>
            )}

            {/* Content Ratings */}
            {series.contentRatings.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('contentRatings')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {series.contentRatings.map((cr) => (
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
            {series.altTitles.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('alternativeTitles')}
                </h2>
                <div className="bg-surface rounded-lg border border-border overflow-hidden">
                  <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
                    {series.altTitles.map((at) => (
                      <div
                        key={at.id}
                        className="flex items-center justify-between px-4 py-2.5"
                      >
                        <span className="text-sm text-foreground/80">
                          {at.title}
                        </span>
                        <span className="text-xs font-mono text-foreground/50 bg-background px-1.5 py-0.5 rounded">
                          {at.countryCode}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
              <TmdbImage 
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

            {/* Images */}
            {series.images.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('images')} ({series.images.length})
                </h2>
                <MediaGallery images={series.images} />
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
                    creditId: c.id,
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
                <TmdbImage 
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
                          {translateJob(credit.job, locale)}
                          {credit.department ? ` · ${translateDepartment(credit.department, locale)}` : ''}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {series.recommendations.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  {t('recommendations')}
                </h2>
                <RecommendationList items={series.recommendations} />
              </div>
            )}
          </div>

          {/* Right: sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0 space-y-5">
            {/* Annotation Panel (watch status, rating, episode tracking, notes) */}
            <AnnotationPanel entityType="TV" entityId={series.id} />

            <div className="bg-surface rounded-lg border border-border p-6 space-y-5 sticky top-24">
              {/* Status */}
              <InfoRow label={t('status')} value={translateStatus(series.status, locale)} />

              {/* Type */}
              <InfoRow label={t('type')} value={series.type ?? '—'} />

              {/* First Air Date */}
              <InfoRow label={t('firstAirDate')} value={formatDate(series.firstAirDate, locale)} />

              {/* Last Air Date */}
              <InfoRow label={t('lastAirDate')} value={formatDate(series.lastAirDate, locale)} />

              {/* Seasons / Episodes */}
              <InfoRow
                label={t('seasons')}
                value={series.numberOfSeasons !== null ? String(series.numberOfSeasons) : '—'}
              />
              <InfoRow
                label={t('episodes')}
                value={series.numberOfEpisodes !== null ? String(series.numberOfEpisodes) : '—'}
              />

              {/* Original Language */}
              <InfoRow
                label={t('originalLanguage')}
                value={series.originalLanguage.toUpperCase()}
              />

              {/* Origin Country */}
              <InfoRow
                label={t('originCountry')}
                value={series.originCountry ?? '—'}
              />

              {/* External Links */}
              <div className="pt-3 border-t border-border">
                <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">
                  {t('externalLinks')}
                </h3>
                <ExternalLinks
                  externalIds={series.externalIds}
                  tmdbId={series.tmdbId}
                  mediaType="tv"
                  homepage={series.homepage}
                />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

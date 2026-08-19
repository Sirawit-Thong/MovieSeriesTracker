'use client';

import {useRef, useCallback} from 'react';
import TmdbImage from '@/components/ui/TmdbImage';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import PersonInfo from './PersonInfo';
import Filmography from './Filmography';
import MediaGallery from '@/components/media/MediaGallery';
import ExternalLinks from '@/components/media/ExternalLinks';
import SyncButton from '@/components/shared/SyncButton';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/** Union of all Prisma relation types included by the page query. */
export type PersonWithRelations = {
  id: number;
  tmdbId: number;
  name: string;
  biography: string | null;
  birthday: string | null;
  deathday: string | null;
  gender: number;
  homepage: string | null;
  imdbId: string | null;
  knownForDepartment: string | null;
  alsoKnownAs: string | null;
  placeOfBirth: string | null;
  popularity: number | null;
  profilePath: string | null;
  adult: boolean;
  castCredits: Array<{
    id: number;
    character: string | null;
    order: number | null;
    movie: {
      id: number;
      tmdbId: number;
      title: string;
      posterPath: string | null;
      releaseDate: Date | null;
      voteAverage: number | null;
    } | null;
    tvSeries: {
      id: number;
      tmdbId: number;
      name: string;
      posterPath: string | null;
      firstAirDate: string | null;
      voteAverage: number | null;
    } | null;
  }>;
  crewCredits: Array<{
    id: number;
    department: string | null;
    job: string | null;
    movie: {
      id: number;
      tmdbId: number;
      title: string;
      posterPath: string | null;
      releaseDate: Date | null;
      voteAverage: number | null;
    } | null;
    tvSeries: {
      id: number;
      tmdbId: number;
      name: string;
      posterPath: string | null;
      firstAirDate: string | null;
      voteAverage: number | null;
    } | null;
  }>;
  // Sub-resources
  combinedCredits: Array<{
    id: number;
    mediaType: string;
    mediaId: number;
    character: string | null;
    department: string | null;
    job: string | null;
    creditId: string | null;
    title: string | null;
    overview: string | null;
    popularity: number | null;
    releaseDate: string | null;
    voteAverage: number | null;
    voteCount: number | null;
    posterPath: string | null;
    backdropPath: string | null;
    genreIds: string | null;
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
};

type PersonDetailProps = {
  person: PersonWithRelations & {
    localized?: {
      name: string | null;
      biography: string | null;
    };
    localizedTitles?: Record<number, string>;
  };
  locale: string;
};

/** Sort combined credits by popularity descending for "Known For" display. */
function getKnownFor(credits: PersonWithRelations['combinedCredits']) {
  return [...credits]
    .filter((c) => c.popularity !== null && c.popularity !== undefined)
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    .slice(0, 8);
}

/**
 * Person detail page — hero section with profile image, name, biography,
 * personal details, full filmography, known for, external links, and profile gallery.
 * Follows the project dark theme (#0a0a0a background, Netflix-red primary).
 */
export default function PersonDetail({person, locale: _locale}: PersonDetailProps) {
  const t = useTranslations('Person');

  const displayName = person.localized?.name ?? person.name;
  const displayBiography = person.localized?.biography ?? person.biography;

  const profileSrc = person.profilePath
    ? `${TMDB_IMAGE_BASE}/w500${person.profilePath}`
    : null;

  /** Split comma-separated alsoKnownAs into an array. */
  const aliases = person.alsoKnownAs
    ? person.alsoKnownAs
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const knownFor = getKnownFor(person.combinedCredits);

  // Known For horizontal scroll
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = useCallback((direction: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('a')?.offsetWidth ?? 150;
    el.scrollBy({left: direction * (cardWidth + 12) * 2, behavior: 'smooth'});
  }, []);

  return (
    <div className="min-h-screen">
      {/* ─── Hero Section ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Profile Image */}
          <div className="flex-shrink-0 w-full lg:w-[300px]">
            <div className="relative aspect-[2/3] w-full max-w-[300px] lg:max-w-none mx-auto lg:mx-0 rounded-lg overflow-hidden shadow-2xl border border-white/10">
              {profileSrc ? (
<TmdbImage 
                  src={profileSrc}
                  alt={displayName}
                  fill
                  fetchPriority="high"
                  loading="eager"
                  sizes="(max-width: 1024px) 300px, 300px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-surface flex items-center justify-center">
                  <span className="text-6xl text-foreground/20 font-bold">
                    {displayName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Name + Biography */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              {displayName}
            </h1>

            {/* Also known as aliases */}
            {aliases.length > 0 && (
              <p className="text-sm text-foreground/50 mt-2">
                {t('alsoKnownAs')}: {aliases.join(', ')}
              </p>
            )}

            {/* Popularity score */}
            {person.popularity !== null && (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">
                  {t('popularity')}
                </span>
                <span className="text-sm text-yellow-400 font-semibold">
                  {person.popularity.toFixed(1)}
                </span>
              </div>
            )}

            {/* External links */}
            <div className="mt-4">
              <ExternalLinks
                externalIds={person.externalIds}
                tmdbId={person.tmdbId}
                mediaType="person"
                homepage={person.homepage}
              />
            </div>

            {/* Sync button */}
            <div className="mt-4">
              <SyncButton type="person" tmdbId={person.tmdbId} />
            </div>

            {/* Biography */}
            {displayBiography && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('biography')}
                </h2>
                <p className="text-foreground/70 leading-relaxed whitespace-pre-line">
                  {displayBiography}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Main Content ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Content */}
          <div className="flex-1 min-w-0">
            {/* Known For */}
            {knownFor.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  {t('knownForSection')}
                </h2>
                <div className="relative group/scroll overflow-hidden">
                  {/* Left arrow */}
                  <button
                    type="button"
                    onClick={() => scrollBy(-1)}
                    className="absolute left-0 top-0 bottom-2 w-8 z-10 flex items-center justify-center bg-gradient-to-r from-background via-background/90 to-transparent opacity-0 group-hover/scroll:opacity-100 transition-opacity cursor-pointer"
                  >
                    <svg className="w-5 h-5 text-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  {/* Right arrow */}
                  <button
                    type="button"
                    onClick={() => scrollBy(1)}
                    className="absolute right-0 top-0 bottom-2 w-8 z-10 flex items-center justify-center bg-gradient-to-l from-background via-background/90 to-transparent opacity-0 group-hover/scroll:opacity-100 transition-opacity cursor-pointer"
                  >
                    <svg className="w-5 h-5 text-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div
                    ref={scrollRef}
                    className="overflow-x-auto scrollbar-hide"
                  >
                    <div className="flex gap-3 min-w-max pb-2">
                      {knownFor.map((credit) => {
                        const detailHref =
                          credit.mediaType === 'movie'
                            ? `/movie/tmdb/${credit.mediaId}`
                            : `/tv/tmdb/${credit.mediaId}`;
                        const posterSrc = credit.posterPath
                          ? `${TMDB_IMAGE_BASE}/w342${credit.posterPath}`
                          : null;

                        return (
                          <Link
                            key={credit.id}
                            href={detailHref}
                            className="group w-[130px] md:w-[150px] flex-shrink-0 bg-surface hover:bg-surface-hover rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:scale-[1.03]"
                          >
                            <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
                              {posterSrc ? (
                                <TmdbImage
                                  src={posterSrc}
                                  alt={credit.title ?? ''}
                                  fill
                                  sizes="150px"
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-sm text-foreground/30">
                                  —
                                </div>
                              )}
                              {credit.voteAverage !== null && credit.voteAverage > 0 && (
                                <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-black/70 backdrop-blur-sm text-[10px] font-semibold text-yellow-400 px-1.5 py-0.5 rounded">
                                  <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  {credit.voteAverage.toFixed(1)}
                                </div>
                              )}
                            </div>
                            <div className="p-2">
                              <p className="text-xs font-medium text-foreground/90 group-hover:text-white line-clamp-2 transition-colors">
                                {credit.title}
                              </p>
                              {credit.character && (
                                <p className="text-[11px] text-foreground/50 line-clamp-1 mt-0.5">
                                  {credit.character}
                                </p>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filmography */}
            <Filmography
              combinedCredits={person.combinedCredits}
              localizedTitles={person.localizedTitles}
            />

            {/* Profile Gallery */}
            {person.images.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {t('profileGallery')} ({person.images.length})
                </h2>
                <MediaGallery images={person.images} />
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <PersonInfo person={person} />
          </aside>
        </div>
      </section>
    </div>
  );
}

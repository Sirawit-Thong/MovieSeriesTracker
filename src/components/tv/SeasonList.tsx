'use client';

import {useState} from 'react';
import Image from 'next/image';
import {useTranslations} from 'next-intl';
import EpisodeList, {type Episode} from './EpisodeList';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export type Season = {
  id: number;
  tmdbId: number;
  airDate: string | null;
  episodeCount: number | null;
  name: string;
  overview: string | null;
  posterPath: string | null;
  seasonNumber: number;
  voteAverage: number | null;
  episodes: Episode[];
};

type SeasonListProps = {
  seasons: Season[];
};

/**
 * List of seasons with expandable episode lists.
 * Each season shows poster, name, episode count, air date, and rating.
 * Click to expand/collapse and reveal episodes.
 */
export default function SeasonList({seasons}: SeasonListProps) {
  const t = useTranslations('Tv');

  // Filter out "Specials" (season 0) unless it has episodes
  const displaySeasons = seasons.filter(
    (s) => s.seasonNumber > 0 || s.episodes.length > 0
  );

  if (displaySeasons.length === 0) {
    return (
      <p className="text-sm text-foreground/40 italic py-4">
        {t('noSeasons')}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">
        {t('seasons')} ({displaySeasons.length})
      </h2>
      {displaySeasons.map((season) => (
        <SeasonCard key={season.id} season={season} t={t} />
      ))}
    </div>
  );
}

function SeasonCard({
  season,
  t,
}: {
  season: Season;
  t: ReturnType<typeof useTranslations>;
}) {
  const [expanded, setExpanded] = useState(false);

  const posterSrc = season.posterPath
    ? `${TMDB_IMAGE_BASE}/w154${season.posterPath}`
    : null;

  const rating =
    season.voteAverage !== null && season.voteAverage > 0
      ? season.voteAverage.toFixed(1)
      : null;

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      {/* Season header — clickable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 hover:bg-surface-hover transition-colors text-left"
      >
        {/* Season poster */}
        <div className="relative flex-shrink-0 w-[60px] h-[80px] rounded overflow-hidden bg-muted">
          {posterSrc ? (
            <Image
              src={posterSrc}
              alt={season.name}
              fill
              sizes="60px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-foreground/30">
              S{season.seasonNumber}
            </div>
          )}
        </div>

        {/* Season info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground/90">
            {season.name}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-foreground/50">
            <span>
              {season.episodeCount} {t('episodes').toLowerCase()}
            </span>
            {season.airDate && <span>{season.airDate}</span>}
            {rating && (
              <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {rating}
              </span>
            )}
          </div>
        </div>

        {/* Expand/collapse chevron */}
        <svg
          className={`w-5 h-5 text-foreground/40 transition-transform duration-200 flex-shrink-0 ${
            expanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded episode list */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border/50">
          {season.overview && (
            <p className="text-xs text-foreground/50 py-3 leading-relaxed">
              {season.overview}
            </p>
          )}
          <EpisodeList episodes={season.episodes} />
        </div>
      )}
    </div>
  );
}

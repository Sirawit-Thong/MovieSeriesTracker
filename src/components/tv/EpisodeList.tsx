'use client';

import {useState} from 'react';
import Image from 'next/image';
import {useTranslations} from 'next-intl';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export type Episode = {
  id: number;
  tmdbId: number;
  airDate: string | null;
  episodeNumber: number;
  name: string;
  overview: string | null;
  stillPath: string | null;
  seasonNumber: number;
  voteAverage: number | null;
};

type EpisodeListProps = {
  episodes: Episode[];
};

/**
 * Compact list of episodes for a season.
 * Each episode shows number, name, air date, still image, overview (truncated), and rating.
 * Overview is expandable to show full text.
 */
export default function EpisodeList({episodes}: EpisodeListProps) {
  const t = useTranslations('Tv');

  if (!episodes || episodes.length === 0) {
    return (
      <p className="text-sm text-foreground/40 italic py-4">
        {t('noEpisodes')}
      </p>
    );
  }

  return (
    <div className="space-y-3 py-2">
      {episodes.map((ep) => (
        <EpisodeCard key={ep.id} episode={ep} t={t} />
      ))}
    </div>
  );
}

function EpisodeCard({
  episode,
  t,
}: {
  episode: Episode;
  t: ReturnType<typeof useTranslations>;
}) {
  const [expanded, setExpanded] = useState(false);

  const stillSrc = episode.stillPath
    ? `${TMDB_IMAGE_BASE}/w300${episode.stillPath}`
    : null;

  const rating =
    episode.voteAverage !== null
      ? episode.voteAverage.toFixed(1)
      : null;

  const hasOverview = episode.overview && episode.overview.length > 0;

  return (
    <div className="flex gap-3 bg-surface/50 rounded-lg p-3 border border-border/50">
      {/* Still image */}
      <div className="relative flex-shrink-0 w-[120px] md:w-[160px] aspect-video rounded overflow-hidden bg-muted">
        {stillSrc ? (
          <Image
            src={stillSrc}
            alt={`E${episode.episodeNumber} - ${episode.name}`}
            fill
            sizes="(max-width: 768px) 120px, 160px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-foreground/30">
            E{episode.episodeNumber}
          </div>
        )}
      </div>

      {/* Episode info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-foreground/50">
              {t('episode')} {episode.episodeNumber}
            </p>
            <h4 className="text-sm font-medium text-foreground/90 line-clamp-1">
              {episode.name}
            </h4>
          </div>
          {rating && (
            <span className="flex items-center gap-1 text-xs font-semibold text-yellow-400 flex-shrink-0">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {rating}
            </span>
          )}
        </div>

        {episode.airDate && (
          <p className="text-xs text-foreground/40 mt-1">{episode.airDate}</p>
        )}

        {/* Overview */}
        {hasOverview && (
          <div className="mt-1.5">
            <p
              className={`text-xs text-foreground/60 leading-relaxed ${
                expanded ? '' : 'line-clamp-2'
              }`}
            >
              {episode.overview}
            </p>
            {episode.overview!.length > 120 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-primary hover:text-primary-hover mt-1 transition-colors"
              >
                {expanded ? t('showLess') : t('showMore')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

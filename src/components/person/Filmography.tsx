'use client';

import {useLocale, useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {translateJob, translateDepartment} from '@/lib/crew-translations';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

type MovieCredit = {
  id: number;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  releaseDate: Date | null;
  voteAverage: number | null;
};

type TvCredit = {
  id: number;
  tmdbId: number;
  name: string;
  posterPath: string | null;
  firstAirDate: string | null;
  voteAverage: number | null;
};

type CastCreditEntry = {
  id: number;
  character: string | null;
  order: number | null;
  movie: MovieCredit | null;
  tvSeries: TvCredit | null;
};

type CrewCreditEntry = {
  id: number;
  department: string | null;
  job: string | null;
  movie: MovieCredit | null;
  tvSeries: TvCredit | null;
};

type FilmographyProps = {
  castCredits: CastCreditEntry[];
  crewCredits: CrewCreditEntry[];
};

function extractYear(credit: {movie: MovieCredit | null; tvSeries: TvCredit | null}): number {
  if (credit.movie?.releaseDate) {
    return new Date(credit.movie.releaseDate).getFullYear();
  }
  if (credit.tvSeries?.firstAirDate) {
    try {
      return new Date(credit.tvSeries.firstAirDate).getFullYear();
    } catch {
      return 0;
    }
  }
  return 0;
}

function getCreditTitle(credit: {movie: MovieCredit | null; tvSeries: TvCredit | null}): string {
  if (credit.movie) return credit.movie.title;
  if (credit.tvSeries) return credit.tvSeries.name;
  return '—';
}

function getCreditTmdbId(credit: {movie: MovieCredit | null; tvSeries: TvCredit | null}): number | null {
  if (credit.movie) return credit.movie.tmdbId;
  if (credit.tvSeries) return credit.tvSeries.tmdbId;
  return null;
}

function getCreditRoute(credit: {movie: MovieCredit | null; tvSeries: TvCredit | null}): string {
  if (credit.movie) return '/movie/tmdb';
  if (credit.tvSeries) return '/tv/tmdb';
  return '';
}

function getCreditRating(credit: {movie: MovieCredit | null; tvSeries: TvCredit | null}): number | null {
  if (credit.movie?.voteAverage !== null && credit.movie?.voteAverage !== undefined) {
    return credit.movie.voteAverage;
  }
  if (credit.tvSeries?.voteAverage !== null && credit.tvSeries?.voteAverage !== undefined) {
    return credit.tvSeries.voteAverage;
  }
  return null;
}

function formatYear(credit: {movie: MovieCredit | null; tvSeries: TvCredit | null}): string {
  const year = extractYear(credit);
  return year > 0 ? String(year) : '—';
}

function getCreditPosterPath(credit: {movie: MovieCredit | null; tvSeries: TvCredit | null}): string | null {
  if (credit.movie?.posterPath) return credit.movie.posterPath;
  if (credit.tvSeries?.posterPath) return credit.tvSeries.posterPath;
  return null;
}

function isTvCredit(credit: {movie: MovieCredit | null; tvSeries: TvCredit | null}): boolean {
  return credit.tvSeries !== null;
}

export default function Filmography({castCredits, crewCredits}: FilmographyProps) {
  const t = useTranslations('Person');
  const locale = useLocale();

  const actingMovies = castCredits.filter((c) => c.movie);
  const actingTv = castCredits.filter((c) => c.tvSeries);

  const directingCredits = crewCredits.filter(
    (c) => c.department?.toLowerCase() === 'directing'
  );
  const producingCredits = crewCredits.filter(
    (c) => c.department?.toLowerCase() === 'production'
  );
  const otherCrewCredits = crewCredits.filter(
    (c) =>
      c.department?.toLowerCase() !== 'directing' &&
      c.department?.toLowerCase() !== 'production'
  );

  const sortByYear = <T extends {movie: MovieCredit | null; tvSeries: TvCredit | null}>(
    items: T[]
  ): T[] => [...items].sort((a, b) => extractYear(b) - extractYear(a));

  const sections: Array<{
    title: string;
    items: Array<CrewCreditEntry | CastCreditEntry>;
    isCast: boolean;
  }> = [
    {title: t('actingCreditsMovies'), items: sortByYear(actingMovies), isCast: true},
    {title: t('actingCreditsTv'), items: sortByYear(actingTv), isCast: true},
    {title: t('directingCredits'), items: sortByYear(directingCredits), isCast: false},
    {title: t('producingCredits'), items: sortByYear(producingCredits), isCast: false},
    {title: t('otherCrewCredits'), items: sortByYear(otherCrewCredits), isCast: false},
  ];

  const activeSections = sections.filter((s) => s.items.length > 0);

  if (activeSections.length === 0) return null;

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-foreground">
        {t('filmography')}
      </h2>

      {activeSections.map((section) => (
        <div key={section.title}>
          <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider mb-3">
            {section.title}
          </h3>
          <div className="bg-surface rounded-lg border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {section.items.map((credit) => {
                const route = getCreditRoute(credit);
                const tmdbId = getCreditTmdbId(credit);
                const href = route && tmdbId ? `${route}/${tmdbId}` : '#';
                const posterPath = getCreditPosterPath(credit);
                const isTv = isTvCredit(credit);

                return (
                  <Link
                    key={credit.id}
                    href={href}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-surface-hover transition-colors group"
                  >
                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0 w-10 h-14 rounded overflow-hidden bg-muted">
                      {posterPath ? (
                        <img
                          src={`${TMDB_IMAGE_BASE}/w92${posterPath}`}
                          alt={getCreditTitle(credit)}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-foreground/30">
                          —
                        </div>
                      )}
                    </div>

                    {/* Year */}
                    <span className="flex-shrink-0 w-12 text-sm text-foreground/50 font-mono">
                      {formatYear(credit)}
                    </span>

                    {/* Title + Type badge */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground/90 group-hover:text-white truncate transition-colors">
                          {getCreditTitle(credit)}
                        </p>
                        <span className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          isTv
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {isTv ? 'TV' : 'Movie'}
                        </span>
                      </div>
                    </div>

                    {/* Character / Department · Job */}
                    <div className="hidden sm:block flex-shrink-0 w-[200px] text-right">
                      {section.isCast ? (
                        <span className="text-sm text-foreground/50 truncate block">
                          {('character' in credit ? credit.character : null) ?? '—'}
                        </span>
                      ) : (
                        <span className="text-sm text-foreground/50 truncate block">
                          {'job' in credit ? translateJob(credit.job, locale) : null}
                          {'department' in credit && credit.department
                            ? ` · ${translateDepartment(credit.department, locale)}`
                            : ''}
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex-shrink-0 w-16 text-right">
                      {(() => {
                        const rating = getCreditRating(credit);
                        if (rating !== null && rating > 0) {
                          return (
                            <span className="text-sm text-yellow-400 font-medium">
                              {rating.toFixed(1)}
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

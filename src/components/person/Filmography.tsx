'use client';

import {useCallback, useState} from 'react';
import {useSession} from 'next-auth/react';
import {useLocale, useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {translateJob, translateDepartment} from '@/lib/crew-translations';

import TmdbImage from '@/components/ui/TmdbImage';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

type CombinedCredit = {
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
};

type FilmographyProps = {
  combinedCredits: CombinedCredit[];
  localizedTitles?: Record<number, string>;
};

function extractYear(releaseDate: string | null): number {
  if (!releaseDate) return 0;
  try {
    return new Date(releaseDate).getFullYear();
  } catch {
    return 0;
  }
}

function formatYear(releaseDate: string | null): string {
  const year = extractYear(releaseDate);
  return year > 0 ? String(year) : '—';
}

function getDetailRoute(credit: CombinedCredit): string {
  if (credit.mediaType === 'movie') return `/movie/tmdb/${credit.mediaId}`;
  if (credit.mediaType === 'tv') return `/tv/tmdb/${credit.mediaId}`;
  return '#';
}

function BookmarkButton({mediaType, mediaId}: {mediaType: string; mediaId: number}) {
  const tLib = useTranslations('Library');
  const {data: session} = useSession();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const entityType = mediaType === 'movie' ? 'movie' : 'tv';

  const handleSave = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saving || saved || !session?.user) return;

    setSaving(true);
    try {
      const res = await fetch('/api/library/save', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({entityType, tmdbId: mediaId, watchStatus: 'WANT_TO_WATCH'}),
      });
      if (res.ok) {
        setSaved(true);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }, [saving, saved, session, entityType, mediaId]);

  if (!session?.user) return null;

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={saving || saved}
      title={saved ? tLib('saved') : tLib('addToLibrary')}
      className={`flex-shrink-0 p-1.5 rounded-md transition-colors disabled:cursor-default ${
        saved
          ? 'text-green-400'
          : 'text-foreground/30 hover:text-primary hover:bg-primary/10'
      }`}
    >
      {saving ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : saved ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )}
    </button>
  );
}

export default function Filmography({combinedCredits, localizedTitles = {}}: FilmographyProps) {
  const t = useTranslations('Person');
  const locale = useLocale();

  // Split into acting (has character) and crew (has department/job)
  const actingCredits = combinedCredits.filter((c) => c.character);
  const crewCredits = combinedCredits.filter((c) => !c.character && (c.department || c.job));

  // Separate by media type
  const actingMovies = actingCredits.filter((c) => c.mediaType === 'movie');
  const actingTv = actingCredits.filter((c) => c.mediaType === 'tv');

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

  const sortByYearDesc = <T extends {releaseDate: string | null}>(items: T[]): T[] =>
    [...items].sort((a, b) => extractYear(b.releaseDate) - extractYear(a.releaseDate));

  const sections: Array<{
    title: string;
    items: CombinedCredit[];
    isCast: boolean;
  }> = [
    {title: t('actingCreditsMovies'), items: sortByYearDesc(actingMovies), isCast: true},
    {title: t('actingCreditsTv'), items: sortByYearDesc(actingTv), isCast: true},
    {title: t('directingCredits'), items: sortByYearDesc(directingCredits), isCast: false},
    {title: t('producingCredits'), items: sortByYearDesc(producingCredits), isCast: false},
    {title: t('otherCrewCredits'), items: sortByYearDesc(otherCrewCredits), isCast: false},
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
                const href = getDetailRoute(credit);
                const isTv = credit.mediaType === 'tv';

                return (
                  <div
                    key={credit.id}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-surface-hover transition-colors group"
                  >
                    {/* Clickable area */}
                    <Link href={href} className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Thumbnail */}
                      <div className="relative flex-shrink-0 w-10 h-14 rounded overflow-hidden bg-muted">
                        {credit.posterPath ? (
                          <TmdbImage
                            src={`${TMDB_IMAGE_BASE}/w92${credit.posterPath}`}
                            alt={credit.title ?? ''}
                            width={40}
                            height={56}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-foreground/30">
                            —
                          </div>
                        )}
                      </div>

                      {/* Year */}
                      <span className="flex-shrink-0 w-12 text-sm text-foreground/50 font-mono">
                        {formatYear(credit.releaseDate)}
                      </span>

                      {/* Title + Type badge */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white truncate transition-colors">
                            {localizedTitles[credit.mediaId] || credit.title || '—'}
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
                            {credit.character ?? '—'}
                          </span>
                        ) : (
                          <span className="text-sm text-foreground/50 truncate block">
                            {credit.job ? translateJob(credit.job, locale) : null}
                            {credit.department
                              ? ` · ${translateDepartment(credit.department, locale)}`
                              : ''}
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="flex-shrink-0 w-16 text-right">
                        {credit.voteAverage !== null && credit.voteAverage !== undefined && credit.voteAverage > 0 && (
                          <span className="text-sm text-yellow-400 font-medium">
                            {credit.voteAverage.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Bookmark / Save button */}
                    <BookmarkButton mediaType={credit.mediaType} mediaId={credit.mediaId} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

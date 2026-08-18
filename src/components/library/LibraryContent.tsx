'use client';

import {useState, useEffect, useCallback, useRef} from 'react';
import {useTranslations} from 'next-intl';
import {useRouter} from '@/i18n/navigation';
import {Link} from '@/i18n/navigation';
import {useSession} from 'next-auth/react';

const TMDB_IMG = 'https://image.tmdb.org/t/p';
const TMDB_IMG_W300 = `${TMDB_IMG}/w300`;

type LibraryItem = {
  id: number;
  entityType: string;
  entityId: number;
  watchStatus: string | null;
  personalRating: number | null;
  currentEpisode: number | null;
  totalEpisodes: number | null;
  notes: string | null;
  watchDate: string | null;
  updatedAt: string;
  source?: 'annotation' | 'watchlist';
  localizedTitle?: string;
  movie: {
    id: number;
    title: string;
    posterPath: string | null;
    backdropPath: string | null;
    voteAverage: number | null;
    overview: string | null;
    releaseDate: string | null;
    runtime: number | null;
    tmdbId: number;
  } | null;
  tvSeries: {
    id: number;
    name: string;
    posterPath: string | null;
    backdropPath: string | null;
    voteAverage: number | null;
    overview: string | null;
    firstAirDate: string | null;
    numberOfSeasons: number | null;
    numberOfEpisodes: number | null;
    tmdbId: number;
  } | null;
};

type TmdbSearchResult = {
  id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number | null;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
};

type TmdbSearchResponse = {
  movies: Array<{id: number; tmdbId: number; title: string; posterPath: string | null; voteAverage: number | null; releaseDate: string | null; source: string}>;
  tvSeries: Array<{id: number; tmdbId: number; name: string; posterPath: string | null; voteAverage: number | null; firstAirDate: string | null; source: string}>;
  persons: Array<{id: number; tmdbId: number; name: string}>;
};

const STATUS_COLORS: Record<string, string> = {
  WATCHED: 'bg-green-400/20 text-green-400',
  WATCHING: 'bg-blue-400/20 text-blue-400',
  WANT_TO_WATCH: 'bg-yellow-400/20 text-yellow-400',
  DROPPED: 'bg-red-400/20 text-red-400',
};

const STATUS_LABELS: Record<string, 'watched' | 'watching' | 'wantToWatch' | 'dropped'> = {
  WATCHED: 'watched',
  WATCHING: 'watching',
  WANT_TO_WATCH: 'wantToWatch',
  DROPPED: 'dropped',
};

export default function LibraryContent({locale}: {locale: string}) {
  const t = useTranslations('Library');
  const tAnnotation = useTranslations('annotation');
  const router = useRouter();
  const {data: session} = useSession();

  const [items, setItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'MOVIE' | 'TV'>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'rating' | 'title'>('updatedAt');

  // TMDB search state
  const [tmdbQuery, setTmdbQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState<TmdbSearchResponse | null>(null);
  const [tmdbSearching, setTmdbSearching] = useState(false);
  const [savingTmdbId, setSavingTmdbId] = useState<number | null>(null);
  const tmdbSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch library items
  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;

    async function fetchLibrary() {
      try {
        const params = new URLSearchParams();
        if (filterType !== 'ALL') params.set('entityType', filterType);
        if (filterStatus !== 'ALL') params.set('status', filterStatus);
        if (localSearch) params.set('search', localSearch);
        params.set('sortBy', sortBy);
        params.set('locale', locale);

        const res = await fetch(`/api/library?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch library');
        const data = await res.json();
        if (!cancelled) setItems(data);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchLibrary();
    return () => { cancelled = true; };
  }, [session, filterType, filterStatus, localSearch, sortBy, locale]);

  // TMDB search with debounce
  const handleTmdbSearch = useCallback((query: string) => {
    setTmdbQuery(query);
    if (tmdbSearchTimerRef.current) {
      clearTimeout(tmdbSearchTimerRef.current);
    }

    if (!query.trim()) {
      setTmdbResults(null);
      return;
    }

    tmdbSearchTimerRef.current = setTimeout(async () => {
      setTmdbSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setTmdbResults(data);
        }
      } catch {
        setTmdbResults(null);
      } finally {
        setTmdbSearching(false);
      }
    }, 300);
  }, []);

  // Save TMDB item to library and navigate
  const saveToLibrary = useCallback(async (entityType: 'movie' | 'tv', tmdbId: number) => {
    setSavingTmdbId(tmdbId);
    try {
      const res = await fetch('/api/library/save', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({entityType, tmdbId, watchStatus: 'WANT_TO_WATCH'}),
      });
      if (res.ok) {
        // Navigate to the detail page
        router.push(`/${entityType === 'movie' ? 'movie' : 'tv'}/tmdb/${tmdbId}`);
      }
    } catch {
      // ignore
    } finally {
      setSavingTmdbId(null);
    }
  }, [router]);

  if (!session?.user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-foreground/50">Please sign in to view your library.</p>
      </div>
    );
  }

  const getTitle = (item: LibraryItem) => {
    if (item.localizedTitle) return item.localizedTitle;
    if (item.entityType === 'MOVIE' && item.movie) return item.movie.title;
    if (item.entityType === 'TV' && item.tvSeries) return item.tvSeries.name;
    return 'Unknown';
  };

  const getPoster = (item: LibraryItem) => {
    const path = item.entityType === 'MOVIE'
      ? item.movie?.posterPath
      : item.tvSeries?.posterPath;
    return path ? `${TMDB_IMG_W300}${path}` : null;
  };

  const getLink = (item: LibraryItem) => {
    if (item.entityType === 'MOVIE') {
      const tmdbId = item.movie?.tmdbId;
      return tmdbId ? `/movie/${tmdbId}` : `/movies/${item.entityId}`;
    }
    const tmdbId = item.tvSeries?.tmdbId;
    return tmdbId ? `/tv/${tmdbId}` : `/tv-series/${item.entityId}`;
  };

  const getYear = (item: LibraryItem) => {
    const date = item.entityType === 'MOVIE'
      ? item.movie?.releaseDate
      : item.tvSeries?.firstAirDate;
    return date ? new Date(date).getFullYear() : null;
  };

  const hasTmdbResults = tmdbResults && (
    tmdbResults.movies.length > 0 || tmdbResults.tvSeries.length > 0
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
        <p className="text-foreground/50">{t('subtitle')}</p>
      </div>

      {/* TMDB Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={tmdbQuery}
            onChange={(e) => handleTmdbSearch(e.target.value)}
            placeholder={t('searchTmdbPlaceholder')}
            className="w-full pl-12 pr-12 py-4 bg-surface border border-border rounded-xl text-foreground text-lg placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {tmdbQuery && (
            <button
              type="button"
              onClick={() => { setTmdbQuery(''); setTmdbResults(null); }}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-foreground/40 hover:text-foreground"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* TMDB Search Results */}
        {tmdbQuery && (
          <div className="mt-4">
            {tmdbSearching ? (
              <div className="flex items-center justify-center py-8">
                <svg className="w-6 h-6 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : hasTmdbResults ? (
              <div className="bg-surface border border-border rounded-xl p-4">
                <p className="text-xs text-foreground/50 mb-3">TMDB Search Results — click to add to library</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {/* Movies */}
                  {tmdbResults!.movies.map((movie) => (
                    <button
                      key={`movie-${movie.tmdbId}`}
                      type="button"
                      onClick={() => saveToLibrary('movie', movie.tmdbId)}
                      disabled={savingTmdbId === movie.tmdbId}
                      className="group relative flex flex-col rounded-lg overflow-hidden bg-background border border-border hover:border-blue-500/50 transition-all text-left disabled:opacity-50"
                    >
                      <div className="relative aspect-[2/3] w-full overflow-hidden">
                        {movie.posterPath ? (
                          <img
                            src={`${TMDB_IMG}/w300${movie.posterPath}`}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-foreground/40">No Image</div>
                        )}
                        <div className="absolute top-2 left-2 bg-blue-500/80 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded">
                          Movie
                        </div>
                        {savingTmdbId === movie.tmdbId && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          </div>
                        )}
                        {movie.voteAverage != null && movie.voteAverage > 0 && (
                          <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/70 backdrop-blur-sm text-[10px] font-semibold text-yellow-400 px-1.5 py-0.5 rounded">
                            ★ {movie.voteAverage.toFixed(1)}
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-blue-400 transition-colors">
                          {movie.title}
                        </p>
                        {movie.releaseDate && (
                          <p className="text-[10px] text-foreground/40 mt-0.5">
                            {new Date(movie.releaseDate).getFullYear()}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}

                  {/* TV Series */}
                  {tmdbResults!.tvSeries.map((series) => (
                    <button
                      key={`tv-${series.tmdbId}`}
                      type="button"
                      onClick={() => saveToLibrary('tv', series.tmdbId)}
                      disabled={savingTmdbId === series.tmdbId}
                      className="group relative flex flex-col rounded-lg overflow-hidden bg-background border border-border hover:border-purple-500/50 transition-all text-left disabled:opacity-50"
                    >
                      <div className="relative aspect-[2/3] w-full overflow-hidden">
                        {series.posterPath ? (
                          <img
                            src={`${TMDB_IMG}/w300${series.posterPath}`}
                            alt={series.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-foreground/40">No Image</div>
                        )}
                        <div className="absolute top-2 left-2 bg-purple-500/80 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded">
                          TV
                        </div>
                        {savingTmdbId === series.tmdbId && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          </div>
                        )}
                        {series.voteAverage != null && series.voteAverage > 0 && (
                          <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/70 backdrop-blur-sm text-[10px] font-semibold text-yellow-400 px-1.5 py-0.5 rounded">
                            ★ {series.voteAverage.toFixed(1)}
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-purple-400 transition-colors">
                          {series.name}
                        </p>
                        {series.firstAirDate && (
                          <p className="text-[10px] text-foreground/40 mt-0.5">
                            {new Date(series.firstAirDate).getFullYear()}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-xl p-6 text-center">
                <p className="text-foreground/50 text-sm">{t('noResults')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-border mb-8" />

      {/* Library Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Local search */}
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm
            focus:outline-none focus:ring-2 focus:ring-primary/50"
        />

        {/* Type filter */}
        <div className="flex gap-1 bg-surface border border-border rounded-lg p-1">
          {(['ALL', 'MOVIE', 'TV'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterType === type
                  ? 'bg-primary text-white'
                  : 'text-foreground/60 hover:text-white'
              }`}
            >
              {type === 'ALL' ? t('all') : type === 'MOVIE' ? t('movies') : t('tvSeries')}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm
            focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="ALL">{t('all')}</option>
          <option value="WATCHED">{t('watched')}</option>
          <option value="WATCHING">{t('watching')}</option>
          <option value="WANT_TO_WATCH">{t('wantToWatch')}</option>
          <option value="DROPPED">{t('dropped')}</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm
            focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="updatedAt">{t('sortUpdated')}</option>
          <option value="rating">{t('sortRating')}</option>
          <option value="title">{t('sortTitle')}</option>
        </select>
      </div>

      {/* Library Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({length: 10}).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] bg-surface rounded-lg mb-2" />
              <div className="h-4 bg-surface rounded w-3/4 mb-1" />
              <div className="h-3 bg-surface rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-foreground/70 mb-2">{t('empty')}</p>
          <p className="text-sm text-foreground/40">{t('emptyDescription')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => {
            const poster = getPoster(item);
            const title = getTitle(item);
            const link = getLink(item);
            const year = getYear(item);

            return (
              <Link key={item.id} href={link} className="group">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-surface mb-2">
                  {poster ? (
                    <img
                      src={poster}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground/30 text-sm">
                      No Image
                    </div>
                  )}

                  {/* Status badge */}
                  {item.watchStatus && (
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[item.watchStatus] ?? ''}`}>
                      {tAnnotation(STATUS_LABELS[item.watchStatus] ?? item.watchStatus)}
                    </div>
                  )}

                  {/* Rating badge */}
                  {item.personalRating && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-yellow-400 text-xs font-bold">
                      ★ {item.personalRating}
                    </div>
                  )}

                  {/* Episode progress for TV */}
                  {item.entityType === 'TV' && item.currentEpisode != null && item.totalEpisodes != null && item.totalEpisodes > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                      <div className="w-full bg-white/20 rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{width: `${Math.min(100, (item.currentEpisode / item.totalEpisodes) * 100)}%`}}
                        />
                      </div>
                      <p className="text-[10px] text-white/70 mt-0.5 text-center">
                        {item.currentEpisode}/{item.totalEpisodes}
                      </p>
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-medium text-white group-hover:text-primary transition-colors line-clamp-1">
                  {title}
                </h3>
                <p className="text-xs text-foreground/40">
                  {year && <span>{year}</span>}
                  {item.entityType === 'TV' && item.tvSeries?.numberOfSeasons && (
                    <span> · {item.tvSeries.numberOfSeasons} seasons</span>
                  )}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

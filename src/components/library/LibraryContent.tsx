'use client';

import {useState, useEffect, useCallback, useRef, useMemo} from 'react';
import {useTranslations, useLocale} from 'next-intl';
import {useRouter} from '@/i18n/navigation';
import {Link} from '@/i18n/navigation';
import {useSession} from 'next-auth/react';
import CountryFilter from '@/components/media/CountryFilter';
import {getDisplayName} from '@/lib/i18n/country-names';

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
    productionCountries: Array<{iso31661: string}>;
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
    productionCountries: Array<{iso31661: string}>;
  } | null;
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCountry, setFilterCountry] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('library-country-filter');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [countries, setCountries] = useState<Array<{iso31661: string; name: string; movieCount: number; tvCount: number; totalCount: number}>>([]);

  // Fetch available countries from user's library
  useEffect(() => {
    if (!session?.user) return;
    fetch('/api/library/countries')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setCountries(data))
      .catch(() => {});
  }, [session, items]);

  // Persist country filter to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('library-country-filter', JSON.stringify(filterCountry));
    } catch {}
  }, [filterCountry]);

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
        filterCountry.forEach((c) => params.append('country', c));
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
  }, [session, filterType, filterStatus, localSearch, filterCountry, sortBy, locale]);

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
        router.push(`/${entityType === 'movie' ? 'movie' : 'tv'}/tmdb/${tmdbId}`);
      }
    } catch {
      // ignore
    } finally {
      setSavingTmdbId(null);
    }
  }, [router]);

  // Inline status update — auto-syncs episode count
  const updateStatus = useCallback(async (annotationId: number, newStatus: string) => {
    const item = items.find((i) => i.id === annotationId);
    if (!item) return;

    const patch: Record<string, unknown> = {watchStatus: newStatus};
    if (newStatus === 'WATCHED' && item.tvSeries?.numberOfEpisodes) {
      patch.currentEpisode = item.tvSeries.numberOfEpisodes;
      patch.totalEpisodes = item.tvSeries.numberOfEpisodes;
    } else if (newStatus === 'WATCHING' || newStatus === 'WANT_TO_WATCH') {
      patch.currentEpisode = 0;
    } else if (newStatus === 'DROPPED') {
      // Keep current episode count when dropping
    }

    try {
      const res = await fetch(`/api/annotations/${annotationId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => i.id === annotationId ? {...i, ...patch} : i)
        );
      }
    } catch {
      // ignore
    }
  }, [items]);

  // Inline episode update — auto-syncs watch status
  const updateEpisode = useCallback(async (annotationId: number, currentEpisode: number, totalEpisodes: number | null) => {
    const patch: Record<string, unknown> = {currentEpisode, totalEpisodes};

    if (totalEpisodes && currentEpisode >= totalEpisodes) {
      patch.watchStatus = 'WATCHED';
      patch.currentEpisode = totalEpisodes;
    } else if (totalEpisodes && currentEpisode > 0 && currentEpisode < totalEpisodes) {
      patch.watchStatus = 'WATCHING';
    } else if (currentEpisode === 0) {
      patch.watchStatus = 'WANT_TO_WATCH';
    }

    try {
      const res = await fetch(`/api/annotations/${annotationId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => i.id === annotationId ? {...i, ...patch} : i)
        );
      }
    } catch {
      // ignore
    }
  }, []);

  // Inline rating update (1-5 stars)
  const updateRating = useCallback(async (annotationId: number, rating: number) => {
    try {
      const res = await fetch(`/api/annotations/${annotationId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({personalRating: rating}),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => i.id === annotationId ? {...i, personalRating: rating} : i)
        );
      }
    } catch {
      // ignore
    }
  }, []);

  // Remove annotation from library
  const removeAnnotation = useCallback(async (annotationId: number) => {
    if (!window.confirm(t('removeConfirm'))) return;

    try {
      const res = await fetch(`/api/annotations/${annotationId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== annotationId));
      }
    } catch {
      // ignore
    }
  }, [t]);

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
                          <img src={`${TMDB_IMG}/w300${movie.posterPath}`} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" loading="lazy" />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-foreground/40">No Image</div>
                        )}
                        <div className="absolute top-2 left-2 bg-blue-500/80 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded">
                          {t('movie')}
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
                        <p className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-blue-400 transition-colors">{movie.title}</p>
                        {movie.releaseDate && <p className="text-[10px] text-foreground/40 mt-0.5">{new Date(movie.releaseDate).getFullYear()}</p>}
                      </div>
                    </button>
                  ))}
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
                          <img src={`${TMDB_IMG}/w300${series.posterPath}`} alt={series.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" loading="lazy" />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-foreground/40">No Image</div>
                        )}
                        <div className="absolute top-2 left-2 bg-purple-500/80 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded">
                          {t('tv')}
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
                        <p className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-purple-400 transition-colors">{series.name}</p>
                        {series.firstAirDate && <p className="text-[10px] text-foreground/40 mt-0.5">{new Date(series.firstAirDate).getFullYear()}</p>}
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
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />

        <div className="flex gap-1 bg-surface border border-border rounded-lg p-1">
          {(['ALL', 'MOVIE', 'TV'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterType === type ? 'bg-primary text-white' : 'text-foreground/60 hover:text-white'
              }`}
            >
              {type === 'ALL' ? t('all') : type === 'MOVIE' ? t('movies') : t('tvSeries')}
            </button>
          ))}
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{colorScheme: 'dark'}}
          className="px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="ALL">{t('all')}</option>
          <option value="WATCHED">{t('watched')}</option>
          <option value="WATCHING">{t('watching')}</option>
          <option value="WANT_TO_WATCH">{t('wantToWatch')}</option>
          <option value="DROPPED">{t('dropped')}</option>
        </select>

        <CountryFilter
          countries={countries}
          value={filterCountry}
          onChange={setFilterCountry}
        />

        {/* Quick-select top countries */}
        {(() => {
          const topCountries = countries
            .filter((c) => c.totalCount > 0 && !filterCountry.includes(c.iso31661))
            .slice(0, 5);
          return topCountries.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {topCountries.map((c) => (
                <button
                  key={c.iso31661}
                  type="button"
                  onClick={() => setFilterCountry([...filterCountry, c.iso31661])}
                  className="px-2 py-0.5 text-[11px] rounded-full border border-border text-foreground/50 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-colors"
                >
                  + {getDisplayName(c.iso31661, c.name, locale)}
                </button>
              ))}
            </div>
          ) : null;
        })()}

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          style={{colorScheme: 'dark'}}
          className="px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="updatedAt">{t('sortUpdated')}</option>
          <option value="rating">{t('sortRating')}</option>
          <option value="title">{t('sortTitle')}</option>
        </select>

        {/* View toggle */}
        <div className="flex gap-1 bg-surface border border-border rounded-lg p-1">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'grid' ? 'bg-primary text-white' : 'text-foreground/60 hover:text-white'
            }`}
          >
            {t('gridView')}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'list' ? 'bg-primary text-white' : 'text-foreground/60 hover:text-white'
            }`}
          >
            {t('listView')}
          </button>
        </div>
      </div>

      {/* Active country pills + clear filters */}
      {(filterCountry.length > 0 || filterType !== 'ALL' || filterStatus !== 'ALL' || localSearch) && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {filterCountry.map((code) => {
            const englishName = countries.find((c) => c.iso31661 === code)?.name ?? code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => setFilterCountry((prev) => prev.filter((c) => c !== code))}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors"
              >
                {getDisplayName(code, englishName, locale)}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setFilterCountry([]);
              setFilterType('ALL');
              setFilterStatus('ALL');
              setLocalSearch('');
            }}
            className="text-xs text-foreground/40 hover:text-red-400 transition-colors ml-1"
          >
            {t('clearFilters')}
          </button>
        </div>
      )}

      {/* Library Content */}
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
      ) : viewMode === 'grid' ? (
        /* ── GRID VIEW ── */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => {
            const poster = getPoster(item);
            const title = getTitle(item);
            const link = getLink(item);
            const year = getYear(item);
            const totalEps = item.tvSeries?.numberOfEpisodes;

            return (
              <div key={item.id} className="group flex flex-col">
                {/* Poster */}
                <Link href={link} className="block relative">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-surface mb-2">
                    {poster ? (
                      <img src={poster} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-foreground/30 text-sm">No Image</div>
                    )}

                    {/* Type badge — top left */}
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm text-white ${
                      item.entityType === 'MOVIE' ? 'bg-blue-500/80' : 'bg-purple-500/80'
                    }`}>
                      {item.entityType === 'MOVIE' ? t('movie') : t('tv')}
                    </div>

                    {/* Year badge — bottom left */}
                    {year && year > 0 && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-semibold text-white">
                        {year}
                      </div>
                    )}

                    {/* Delete button — top right, visible on hover */}
                    {item.id > 0 && (
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); removeAnnotation(item.id); }}
                        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white/60 hover:text-red-400 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-all z-10"
                        title={t('remove')}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </Link>

                {/* Title */}
                <Link href={link}>
                  <h3 className="text-sm font-medium text-white group-hover:text-primary transition-colors line-clamp-1">{title}</h3>
                </Link>

                {/* Status + Rating row */}
                {item.id > 0 && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <select
                      value={item.watchStatus ?? ''}
                      onChange={(e) => { const val = e.target.value; if (val) updateStatus(item.id, val); }}
                      style={{colorScheme: 'dark'}}
                      className={`flex-1 px-2 py-1 rounded border text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer ${
                        item.watchStatus ? STATUS_COLORS[item.watchStatus] ?? 'border-border bg-surface text-foreground' : 'border-border bg-surface text-foreground'
                      }`}
                    >
                      <option value="WATCHING">{tAnnotation('watching')}</option>
                      <option value="WATCHED">{tAnnotation('watched')}</option>
                      <option value="WANT_TO_WATCH">{tAnnotation('wantToWatch')}</option>
                      <option value="DROPPED">{tAnnotation('dropped')}</option>
                    </select>

                    {/* Rating stars */}
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => updateRating(item.id, star)}
                          className="cursor-pointer transition-colors"
                        >
                          <svg
                            className={`w-3 h-3 ${(item.personalRating ?? 0) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-foreground/20 fill-current'}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Episode dropdown (TV only) */}
                {item.entityType === 'TV' && item.id > 0 && totalEps && totalEps > 0 && (
                  <div className="mt-1.5">
                    <select
                      value={item.currentEpisode ?? 0}
                      onChange={(e) => { const ep = Number(e.target.value); updateEpisode(item.id, ep, totalEps); }}
                      style={{colorScheme: 'dark'}}
                      className="w-full px-2 py-1 rounded border border-border bg-surface text-foreground text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                    >
                      {Array.from({length: totalEps + 1}, (_, i) => i).map((ep) => (
                        <option key={ep} value={ep}>{ep === 0 ? t('noEpisodes') : `EP ${ep} / ${totalEps}`}</option>
                      ))}
                    </select>
                    {/* Mini progress bar */}
                    <div className="w-full bg-foreground/10 rounded-full h-1 mt-1">
                      <div
                        className="bg-primary h-1 rounded-full transition-all"
                        style={{width: `${Math.min(100, ((item.currentEpisode ?? 0) / totalEps) * 100)}%`}}
                      />
                    </div>
                  </div>
                )}

                {/* Notes preview */}
                {item.notes && (
                  <p className="text-[10px] text-foreground/40 mt-1 line-clamp-1 italic">"{item.notes}"</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ── LIST VIEW ── */
        <div className="space-y-3">
          {items.map((item) => {
            const poster = getPoster(item);
            const title = getTitle(item);
            const link = getLink(item);
            const year = getYear(item);
            const totalEps = item.tvSeries?.numberOfEpisodes;
            const seasons = item.tvSeries?.numberOfSeasons;
            const overview = item.entityType === 'MOVIE' ? item.movie?.overview : item.tvSeries?.overview;
            const rating = item.entityType === 'MOVIE' ? item.movie?.voteAverage : item.tvSeries?.voteAverage;
            const updatedDate = item.updatedAt
              ? new Date(item.updatedAt).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {year: 'numeric', month: 'short', day: 'numeric'})
              : null;

            return (
              <div key={item.id} className="group flex gap-4 p-3 rounded-lg bg-surface border border-border hover:border-primary/30 transition-colors">
                {/* Poster */}
                <Link href={link} className="flex-shrink-0">
                  <div className="relative w-[80px] aspect-[2/3] rounded-lg overflow-hidden bg-background">
                    {poster ? (
                      <img src={poster} alt={title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-foreground/30 text-xs">No Image</div>
                    )}
                    <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider text-white ${
                      item.entityType === 'MOVIE' ? 'bg-blue-500/80' : 'bg-purple-500/80'
                    }`}>
                      {item.entityType === 'MOVIE' ? t('movie') : t('tv')}
                    </div>
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={link}>
                        <h3 className="text-sm font-medium text-white group-hover:text-primary transition-colors line-clamp-1">{title}</h3>
                      </Link>
                      <p className="text-xs text-foreground/40 mt-0.5">
                        {year && <span>{year}</span>}
                        {(() => {
                          const codes = (item.entityType === 'MOVIE' ? item.movie?.productionCountries : item.tvSeries?.productionCountries);
                          const primaryCountry = codes?.[0]?.iso31661;
                          return primaryCountry ? <span> · {getDisplayName(primaryCountry, primaryCountry, locale)}</span> : null;
                        })()}
                        {item.entityType === 'TV' && seasons && seasons > 0 && <span> · {t('seasons', {count: seasons})}</span>}
                        {item.entityType === 'TV' && totalEps && totalEps > 0 && <span> · {t('episodes', {count: totalEps})}</span>}
                        {rating != null && rating > 0 && <span> · ★ {rating.toFixed(1)}</span>}
                      </p>
                    </div>
                    {/* Delete button */}
                    {item.id > 0 && (
                      <button
                        type="button"
                        onClick={() => removeAnnotation(item.id)}
                        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-foreground/30 hover:text-red-400 transition-colors"
                        title={t('remove')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Notes preview */}
                  {item.notes && (
                    <p className="text-[11px] text-foreground/40 mt-1 line-clamp-1 italic">"{item.notes}"</p>
                  )}

                  {/* Overview preview */}
                  {overview && (
                    <p className="text-[11px] text-foreground/30 mt-1 line-clamp-2">{overview}</p>
                  )}

                  {/* Controls row */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {/* Status */}
                    {item.id > 0 && (
                      <select
                        value={item.watchStatus ?? ''}
                        onChange={(e) => { const val = e.target.value; if (val) updateStatus(item.id, val); }}
                        style={{colorScheme: 'dark'}}
                        className={`px-2 py-1 rounded border text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer ${
                          item.watchStatus ? STATUS_COLORS[item.watchStatus] ?? 'border-border bg-background text-foreground' : 'border-border bg-background text-foreground'
                        }`}
                      >
                        <option value="WATCHING">{tAnnotation('watching')}</option>
                        <option value="WATCHED">{tAnnotation('watched')}</option>
                        <option value="WANT_TO_WATCH">{tAnnotation('wantToWatch')}</option>
                        <option value="DROPPED">{tAnnotation('dropped')}</option>
                      </select>
                    )}

                    {/* Episode dropdown (TV only) */}
                    {item.entityType === 'TV' && totalEps && totalEps > 0 && item.id > 0 && (
                      <select
                        value={item.currentEpisode ?? 0}
                        onChange={(e) => { const ep = Number(e.target.value); updateEpisode(item.id, ep, totalEps); }}
                        style={{colorScheme: 'dark'}}
                        className="px-2 py-1 rounded border border-border bg-background text-foreground text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                      >
                        {Array.from({length: totalEps + 1}, (_, i) => i).map((ep) => (
                          <option key={ep} value={ep}>{ep === 0 ? t('noEpisodes') : `EP ${ep} / ${totalEps}`}</option>
                        ))}
                      </select>
                    )}

                    {/* Rating stars */}
                    {item.id > 0 && (
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => updateRating(item.id, star)}
                            className="cursor-pointer transition-colors"
                          >
                            <svg
                              className={`w-3.5 h-3.5 ${(item.personalRating ?? 0) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-foreground/20 fill-current'}`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Last updated */}
                    {updatedDate && (
                      <span className="text-[10px] text-foreground/30 ml-auto">{t('lastUpdated', {date: updatedDate})}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import {useState, useEffect} from 'react';
import Link from 'next/link';
import {useSession} from 'next-auth/react';

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
  movie: {
    id: number;
    title: string;
    posterPath: string | null;
    backdropPath: string | null;
    voteAverage: number | null;
    overview: string | null;
    releaseDate: string | null;
    runtime: number | null;
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
  } | null;
};

type Translations = {
  title: string;
  subtitle: string;
  all: string;
  movies: string;
  tvSeries: string;
  watched: string;
  watching: string;
  wantToWatch: string;
  dropped: string;
  searchPlaceholder: string;
  empty: string;
  emptyDescription: string;
  noResults: string;
  sortBy: string;
  sortUpdated: string;
  sortRating: string;
  sortTitle: string;
};

type Props = {
  locale: string;
  translations: Translations;
};

const TMDB_IMG = 'https://image.tmdb.org/t/p/w300';

const STATUS_COLORS: Record<string, string> = {
  WATCHED: 'bg-green-400/20 text-green-400',
  WATCHING: 'bg-blue-400/20 text-blue-400',
  WANT_TO_WATCH: 'bg-yellow-400/20 text-yellow-400',
  DROPPED: 'bg-red-400/20 text-red-400',
};

const STATUS_LABELS: Record<string, string> = {
  WATCHED: 'watched',
  WATCHING: 'watching',
  WANT_TO_WATCH: 'wantToWatch',
  DROPPED: 'dropped',
};

export default function LibraryContent({locale, translations: t}: Props) {
  const {data: session} = useSession();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'MOVIE' | 'TV'>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'rating' | 'title'>('updatedAt');

  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;

    async function fetchLibrary() {
      try {
        const params = new URLSearchParams();
        if (filterType !== 'ALL') params.set('entityType', filterType);
        if (filterStatus !== 'ALL') params.set('status', filterStatus);
        if (search) params.set('search', search);
        params.set('sortBy', sortBy);

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
  }, [session, filterType, filterStatus, search, sortBy]);

  if (!session?.user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-foreground/50">Please sign in to view your library.</p>
      </div>
    );
  }

  const getTitle = (item: LibraryItem) => {
    if (item.entityType === 'MOVIE' && item.movie) return item.movie.title;
    if (item.entityType === 'TV' && item.tvSeries) return item.tvSeries.name;
    return 'Unknown';
  };

  const getPoster = (item: LibraryItem) => {
    const path = item.entityType === 'MOVIE'
      ? item.movie?.posterPath
      : item.tvSeries?.posterPath;
    return path ? `${TMDB_IMG}${path}` : null;
  };

  const getLink = (item: LibraryItem) => {
    return item.entityType === 'MOVIE'
      ? `/${locale}/movies/${item.entityId}`
      : `/${locale}/tv-series/${item.entityId}`;
  };

  const getYear = (item: LibraryItem) => {
    const date = item.entityType === 'MOVIE'
      ? item.movie?.releaseDate
      : item.tvSeries?.firstAirDate;
    return date ? new Date(date).getFullYear() : null;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
        <p className="text-foreground/50">{t.subtitle}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
              {type === 'ALL' ? t.all : type === 'MOVIE' ? t.movies : t.tvSeries}
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
          <option value="ALL">{t.all}</option>
          <option value="WATCHED">{t.watched}</option>
          <option value="WATCHING">{t.watching}</option>
          <option value="WANT_TO_WATCH">{t.wantToWatch}</option>
          <option value="DROPPED">{t.dropped}</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm
            focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="updatedAt">{t.sortUpdated}</option>
          <option value="rating">{t.sortRating}</option>
          <option value="title">{t.sortTitle}</option>
        </select>
      </div>

      {/* Content */}
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
          <p className="text-xl text-foreground/70 mb-2">{t.empty}</p>
          <p className="text-sm text-foreground/40">{t.emptyDescription}</p>
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
                      {t[STATUS_LABELS[item.watchStatus] as keyof Translations] ?? item.watchStatus}
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

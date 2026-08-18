'use client';

import {useEffect, useState, useCallback} from 'react';
import {Link} from '@/i18n/navigation';

type MediaItem = {
  id: string;
  tmdbId: number;
  title?: string;
  name?: string;
  releaseDate?: string;
  firstAirDate?: string;
  voteAverage: number | null;
  department?: string;
  lastFetchedAt: string;
};

type MediaResponse = {
  items: MediaItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type MediaType = 'movie' | 'tv' | 'person';

const TYPE_TABS: {value: MediaType; label: string}[] = [
  {value: 'movie', label: 'Movies'},
  {value: 'tv', label: 'TV Series'},
  {value: 'person', label: 'Persons'},
];

function MovieTable({items}: {items: MediaItem[]}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border">
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            Title
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            TMDB ID
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            Release Date
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            Rating
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            Last Fetched
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr
            key={item.id}
            className="border-b border-border last:border-0"
          >
            <td className="px-6 py-3 text-foreground font-medium">
              {item.title ?? '—'}
            </td>
            <td className="px-6 py-3 text-foreground/70 font-mono text-xs">
              {item.tmdbId}
            </td>
            <td className="px-6 py-3 text-foreground/60">
              {item.releaseDate
                ? new Date(item.releaseDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : '—'}
            </td>
            <td className="px-6 py-3 text-foreground/70">
              {item.voteAverage?.toFixed(1) ?? '—'}
            </td>
            <td className="px-6 py-3 text-foreground/60">
              {new Date(item.lastFetchedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TvTable({items}: {items: MediaItem[]}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border">
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            Name
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            TMDB ID
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            First Air Date
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            Rating
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            Last Fetched
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr
            key={item.id}
            className="border-b border-border last:border-0"
          >
            <td className="px-6 py-3 text-foreground font-medium">
              {item.name ?? '—'}
            </td>
            <td className="px-6 py-3 text-foreground/70 font-mono text-xs">
              {item.tmdbId}
            </td>
            <td className="px-6 py-3 text-foreground/60">
              {item.firstAirDate
                ? new Date(item.firstAirDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : '—'}
            </td>
            <td className="px-6 py-3 text-foreground/70">
              {item.voteAverage?.toFixed(1) ?? '—'}
            </td>
            <td className="px-6 py-3 text-foreground/60">
              {new Date(item.lastFetchedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PersonTable({items}: {items: MediaItem[]}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border">
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            Name
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            TMDB ID
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            Department
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            Last Fetched
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr
            key={item.id}
            className="border-b border-border last:border-0"
          >
            <td className="px-6 py-3 text-foreground font-medium">
              {item.name ?? '—'}
            </td>
            <td className="px-6 py-3 text-foreground/70 font-mono text-xs">
              {item.tmdbId}
            </td>
            <td className="px-6 py-3 text-foreground/60">
              {item.department ?? '—'}
            </td>
            <td className="px-6 py-3 text-foreground/60">
              {new Date(item.lastFetchedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function AdminMediaPage() {
  const [data, setData] = useState<MediaResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mediaType, setMediaType] = useState<MediaType>('movie');
  const [query, setQuery] = useState('');

  const fetchMedia = useCallback(
    async (p: number, type: MediaType, q: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(p),
          type,
        });
        if (q) params.set('q', q);
        const res = await fetch(`/api/admin/media?${params.toString()}`);
        if (res.ok) {
          setData(await res.json());
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchMedia(page, mediaType, query);
  }, [page, fetchMedia, mediaType, query]);

  function handleTypeChange(type: MediaType) {
    setMediaType(type);
    setPage(1);
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPage(1);
    fetchMedia(1, mediaType, query);
  }

  const totalLabel =
    mediaType === 'movie'
      ? 'movies'
      : mediaType === 'tv'
        ? 'series'
        : 'persons';

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/admin"
            className="text-foreground/60 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-white">Media Browser</h1>
        </div>
        <p className="mt-1 text-foreground/60">
          Browse movies, TV series, and persons in the database.
        </p>
      </div>

      {/* Type Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-1 bg-surface border border-border rounded-lg p-1">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleTypeChange(tab.value)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                mediaType === tab.value
                  ? 'bg-primary text-white'
                  : 'text-foreground/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${totalLabel}...`}
            className="flex-1 px-4 py-2 text-sm rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/80 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Media Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading && !data ? (
            <div className="px-6 py-8 text-center text-foreground/40">
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Loading media...
              </div>
            </div>
          ) : data && data.items.length === 0 ? (
            <div className="px-6 py-8 text-center text-foreground/40">
              No {totalLabel} found.
            </div>
          ) : data ? (
            <>
              {mediaType === 'movie' && <MovieTable items={data.items} />}
              {mediaType === 'tv' && <TvTable items={data.items} />}
              {mediaType === 'person' && <PersonTable items={data.items} />}
            </>
          ) : null}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-foreground/50">
              Page {data.page} of {data.totalPages} ({data.total} {totalLabel})
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm rounded-lg bg-background border border-border text-foreground/70 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((p) => Math.min(data.totalPages, p + 1))
                }
                disabled={page >= data.totalPages}
                className="px-3 py-1.5 text-sm rounded-lg bg-background border border-border text-foreground/70 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

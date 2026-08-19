'use client';

import {useEffect, useState, useCallback} from 'react';
import {useSearchParams} from 'next/navigation';
import {Link} from '@/i18n/navigation';
import {useTranslations, useLocale} from 'next-intl';
import {formatDate} from '@/lib/format-date';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminSpinner from '@/components/admin/AdminSpinner';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import ConfirmButton from '@/components/admin/ConfirmButton';

type MediaItem = {
  id: number;
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

const TYPE_TABS: {value: MediaType; labelKey: string}[] = [
  {value: 'movie', labelKey: 'movies'},
  {value: 'tv', labelKey: 'tvSeries'},
  {value: 'person', labelKey: 'persons'},
];

function MovieTable({items, t, locale, onDelete}: {items: MediaItem[]; t: (key: string) => string; locale: string; onDelete: (item: MediaItem) => void}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border">
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            {t('mediaPage.titleCol')}
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            {t('mediaPage.tmdbId')}
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            {t('mediaPage.releaseDate')}
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            {t('mediaPage.rating')}
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            {t('mediaPage.lastFetched')}
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            {t('actions')}
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr
            key={item.id}
            className="border-b border-border last:border-0"
          >
            <td className="px-6 py-3">
              <Link
                href={`/movie/${item.tmdbId}`}
                className="text-foreground font-medium hover:text-primary transition-colors"
              >
                {item.title ?? '—'}
              </Link>
            </td>
            <td className="px-6 py-3 text-foreground/70 font-mono text-xs">
              {item.tmdbId}
            </td>
            <td className="px-6 py-3 text-foreground/60">
              {item.releaseDate
                ? formatDate(item.releaseDate ?? item.firstAirDate ?? item.lastFetchedAt, locale)
                : '—'}
            </td>
            <td className="px-6 py-3 text-foreground/70">
              {item.voteAverage?.toFixed(1) ?? '—'}
            </td>
            <td className="px-6 py-3 text-foreground/60">
              {formatDate(item.lastFetchedAt, locale)}
            </td>
            <td className="px-6 py-3">
              <ConfirmButton
                onConfirm={() => onDelete(item)}
                confirmLabel={t('mediaPage.confirmDelete')}
              >
                {t('mediaPage.delete')}
              </ConfirmButton>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TvTable({items, t, locale, onDelete}: {items: MediaItem[]; t: (key: string) => string; locale: string; onDelete: (item: MediaItem) => void}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border">
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            {t('mediaPage.nameCol')}
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            {t('mediaPage.tmdbId')}
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            {t('mediaPage.firstAirDate')}
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            {t('mediaPage.rating')}
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            {t('mediaPage.lastFetched')}
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            {t('actions')}
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr
            key={item.id}
            className="border-b border-border last:border-0"
          >
            <td className="px-6 py-3">
              <Link
                href={`/tv/${item.tmdbId}`}
                className="text-foreground font-medium hover:text-primary transition-colors"
              >
                {item.name ?? '—'}
              </Link>
            </td>
            <td className="px-6 py-3 text-foreground/70 font-mono text-xs">
              {item.tmdbId}
            </td>
            <td className="px-6 py-3 text-foreground/60">
              {item.firstAirDate
                ? formatDate(item.releaseDate ?? item.firstAirDate ?? item.lastFetchedAt, locale)
                : '—'}
            </td>
            <td className="px-6 py-3 text-foreground/70">
              {item.voteAverage?.toFixed(1) ?? '—'}
            </td>
            <td className="px-6 py-3 text-foreground/60">
              {formatDate(item.lastFetchedAt, locale)}
            </td>
            <td className="px-6 py-3">
              <ConfirmButton
                onConfirm={() => onDelete(item)}
                confirmLabel={t('mediaPage.confirmDelete')}
              >
                {t('mediaPage.delete')}
              </ConfirmButton>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PersonTable({items, t, locale, onDelete}: {items: MediaItem[]; t: (key: string) => string; locale: string; onDelete: (item: MediaItem) => void}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border">
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            {t('mediaPage.nameCol')}
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            {t('mediaPage.tmdbId')}
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            {t('mediaPage.department')}
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            {t('mediaPage.lastFetched')}
          </th>
          <th className="text-left px-6 py-3 text-foreground/50 font-medium">
            {t('actions')}
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr
            key={item.id}
            className="border-b border-border last:border-0"
          >
            <td className="px-6 py-3">
              <Link
                href={`/person/${item.tmdbId}`}
                className="text-foreground font-medium hover:text-primary transition-colors"
              >
                {item.name ?? '—'}
              </Link>
            </td>
            <td className="px-6 py-3 text-foreground/70 font-mono text-xs">
              {item.tmdbId}
            </td>
            <td className="px-6 py-3 text-foreground/60">
              {item.department ?? '—'}
            </td>
            <td className="px-6 py-3 text-foreground/60">
              {formatDate(item.lastFetchedAt, locale)}
            </td>
            <td className="px-6 py-3">
              <ConfirmButton
                onConfirm={() => onDelete(item)}
                confirmLabel={t('mediaPage.confirmDelete')}
              >
                {t('mediaPage.delete')}
              </ConfirmButton>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function AdminMediaPage() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const urlType = searchParams.get('type');
  const initialType: MediaType =
    urlType === 'tv' ? 'tv' : urlType === 'person' || urlType === 'persons' ? 'person' : 'movie';
  const [data, setData] = useState<MediaResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mediaType, setMediaType] = useState<MediaType>(initialType);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = useCallback(
    async (p: number, type: MediaType, q: string) => {
      try {
        const params = new URLSearchParams({
          page: String(p),
          type,
        });
        if (q) params.set('q', q);
        const res = await fetch(`/api/admin/media?${params.toString()}`);
        if (res.ok) {
          return (await res.json()) as MediaResponse;
        }
        return null;
      } catch {
        return null;
      }
    },
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    fetchMedia(page, mediaType, debouncedQuery)
      .then((nextData) => {
        if (!cancelled) {
          setData(nextData);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError('loadError');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, fetchMedia, mediaType, debouncedQuery]);

  function handleTypeChange(type: MediaType) {
    setMediaType(type);
    setPage(1);
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  async function handleDelete(item: MediaItem) {
    try {
      const typeParam = mediaType === 'movie' ? 'movies' : mediaType === 'tv' ? 'tv' : 'persons';
      const res = await fetch(`/api/admin/media?type=${typeParam}&id=${item.id}`, {method: 'DELETE'});
      if (res.ok) {
        const next = await fetchMedia(page, mediaType, debouncedQuery);
        if (next) {
          setData(next);
          setError(null);
          if (page > next.totalPages) setPage(Math.max(1, next.totalPages));
        } else {
          setError(t('loadError'));
        }
      } else {
        setError(t('mediaPage.deleteError'));
      }
    } catch {
      setError(t('mediaPage.deleteError'));
    }
  }

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
          <h1 className="text-3xl font-bold text-white">{t('mediaPage.title')}</h1>
        </div>
        <p className="mt-1 text-foreground/60">
          {t('mediaPage.subtitle')}
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
              {t(`mediaPage.${tab.labelKey}`)}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('mediaPage.searchPlaceholder')}
            className="flex-1 px-4 py-2 text-sm rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/80 transition-colors"
          >
            {t('searchButton')}
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg">
          {error}
        </div>
      )}

      {/* Media Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading && !data ? (
            <AdminSpinner label={t('loadingMedia')} />
          ) : data && data.items.length === 0 ? (
            <AdminEmptyState message={t('mediaPage.noResults')} />
          ) : data ? (
            <>
              {mediaType === 'movie' && <MovieTable items={data.items} t={t} locale={locale} onDelete={handleDelete} />}
              {mediaType === 'tv' && <TvTable items={data.items} t={t} locale={locale} onDelete={handleDelete} />}
              {mediaType === 'person' && <PersonTable items={data.items} t={t} locale={locale} onDelete={handleDelete} />}
            </>
          ) : null}
        </div>

        {/* Pagination */}
        {data && (
          <AdminPagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}

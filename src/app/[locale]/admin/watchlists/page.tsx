'use client';

import {useEffect, useState, useCallback} from 'react';
import {Link} from '@/i18n/navigation';
import {useTranslations} from 'next-intl';

type Watchlist = {
  id: string;
  name: string;
  description: string | null;
  itemCount: number;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
};

type WatchlistsResponse = {
  watchlists: Watchlist[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export default function AdminWatchlistsPage() {
  const t = useTranslations('Admin');
  const [data, setData] = useState<WatchlistsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchWatchlists = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/watchlists?page=${p}`);
      if (res.ok) {
        setData(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlists(page);
  }, [page, fetchWatchlists]);

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
          <h1 className="text-3xl font-bold text-white">
            {t('watchlistsPage.title')}
          </h1>
        </div>
        <p className="mt-1 text-foreground/60">
          {t('watchlistsPage.subtitle')}
        </p>
      </div>

      {/* Watchlists Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('watchlistsPage.user')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('watchlistsPage.watchlistName')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('watchlistsPage.description')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('watchlistsPage.items')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('watchlistsPage.created')}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && !data && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-foreground/40"
                  >
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
                      {t('loadingWatchlists')}
                    </div>
                  </td>
                </tr>
              )}
              {data?.watchlists.map((watchlist) => (
                <tr
                  key={watchlist.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-6 py-3">
                    <div>
                      <div className="text-foreground">
                        {watchlist.user.name ?? '—'}
                      </div>
                      <div className="text-xs text-foreground/50">
                        {watchlist.user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-foreground font-medium">
                    {watchlist.name}
                  </td>
                  <td className="px-6 py-3 text-foreground/60 max-w-xs truncate">
                    {watchlist.description ?? '—'}
                  </td>
                  <td className="px-6 py-3 text-foreground/70">
                    {watchlist.itemCount}
                  </td>
                  <td className="px-6 py-3 text-foreground/60">
                    {new Date(watchlist.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
              {data && data.watchlists.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-foreground/40"
                  >
                    {t('watchlistsPage.noWatchlists')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-foreground/50">
              {t('pagination', {page: data.page, totalPages: data.totalPages, count: data.total})}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm rounded-lg bg-background border border-border text-foreground/70 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {t('previous')}
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((p) => Math.min(data.totalPages, p + 1))
                }
                disabled={page >= data.totalPages}
                className="px-3 py-1.5 text-sm rounded-lg bg-background border border-border text-foreground/70 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {t('next')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

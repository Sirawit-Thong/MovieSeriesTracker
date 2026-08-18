'use client';

import {useEffect, useState, useCallback} from 'react';
import {Link} from '@/i18n/navigation';
import {useTranslations} from 'next-intl';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminSpinner from '@/components/admin/AdminSpinner';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import ConfirmButton from '@/components/admin/ConfirmButton';

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
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlists = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/watchlists?page=${p}`);
      if (res.ok) {
        setData(await res.json());
        setError(null);
      } else {
        setError(t('loadError'));
      }
    } catch {
      setError(t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

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

      {error && (
        <div className="mb-4 px-4 py-3 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg">
          {error}
        </div>
      )}

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
                <th className="text-right px-6 py-3 text-foreground/50 font-medium">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && !data && (
                <tr>
                  <td colSpan={6}>
                    <AdminSpinner label={t('loadingWatchlists')} />
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
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end">
                      <ConfirmButton
                        onConfirm={async () => {
                          try {
                            const res = await fetch(`/api/admin/watchlists?id=${watchlist.id}`, {method: 'DELETE'});
                            if (res.ok) {
                              await fetchWatchlists(page);
                              if (data && page > data.totalPages) setPage(data.totalPages);
                            } else {
                              setError(t('watchlistsPage.deleteError'));
                            }
                          } catch {
                            setError(t('watchlistsPage.deleteError'));
                          }
                        }}
                        confirmLabel={t('watchlistsPage.confirmDelete')}
                      >
                        {t('watchlistsPage.delete')}
                      </ConfirmButton>
                    </div>
                  </td>
                </tr>
              ))}
              {data && data.watchlists.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <AdminEmptyState message={t('watchlistsPage.noWatchlists')} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
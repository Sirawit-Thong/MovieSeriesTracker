'use client';

import {useEffect, useState, useCallback} from 'react';
import {Link} from '@/i18n/navigation';
import {useTranslations} from 'next-intl';

type SyncLog = {
  id: string;
  entityType: string;
  status: string;
  processedCount: number;
  errorCount: number;
  durationMs: number | null;
  startedAt: string;
  endedAt: string | null;
};

type SyncLogsResponse = {
  logs: SyncLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function StatusBadge({status, t}: {status: string; t: (key: string) => string}) {
  const styles: Record<string, string> = {
    running: 'bg-yellow-500/15 text-yellow-400',
    completed: 'bg-green-500/15 text-green-400',
    failed: 'bg-red-500/15 text-red-400',
  };

  const labelKey = `syncHistoryPage.${status}` as const;

  return (
    <span
      className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${styles[status] ?? 'bg-foreground/10 text-foreground/60'}`}
    >
      {t(labelKey)}
    </span>
  );
}

function formatDuration(ms: number | null): string {
  if (ms === null) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function AdminSyncHistoryPage() {
  const t = useTranslations('Admin');
  const [data, setData] = useState<SyncLogsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/sync-logs?page=${p}`);
      if (res.ok) {
        setData(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(page);
  }, [page, fetchLogs]);

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
          <h1 className="text-3xl font-bold text-white">{t('syncHistoryPage.title')}</h1>
        </div>
        <p className="mt-1 text-foreground/60">
          {t('syncHistoryPage.subtitle')}
        </p>
      </div>

      {/* Sync Logs Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('syncHistoryPage.entity')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('syncHistoryPage.status')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('syncHistoryPage.processed')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('syncHistoryPage.errors')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('syncHistoryPage.duration')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('syncHistoryPage.started')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('syncHistoryPage.ended')}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && !data && (
                <tr>
                  <td
                    colSpan={7}
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
                      {t('loadingSyncLogs')}
                    </div>
                  </td>
                </tr>
              )}
              {data?.logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-6 py-3">
                    <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-foreground/10 text-foreground/60">
                      {log.entityType}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={log.status} t={t} />
                  </td>
                  <td className="px-6 py-3 text-foreground/70">
                    {log.processedCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    {log.errorCount > 0 ? (
                      <span className="text-red-400 font-medium">
                        {log.errorCount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-foreground/40">0</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-foreground/60">
                    {formatDuration(log.durationMs)}
                  </td>
                  <td className="px-6 py-3 text-foreground/60">
                    {new Date(log.startedAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-3 text-foreground/60">
                    {log.endedAt
                      ? new Date(log.endedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </td>
                </tr>
              ))}
              {data && data.logs.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-foreground/40"
                  >
                    {t('syncHistoryPage.noLogs')}
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

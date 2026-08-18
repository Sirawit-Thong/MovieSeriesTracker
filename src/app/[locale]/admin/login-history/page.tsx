'use client';

import {useEffect, useState, useCallback} from 'react';
import {Link} from '@/i18n/navigation';
import {useTranslations} from 'next-intl';

type LoginLog = {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  method: string;
  ip: string | null;
  userAgent: string | null;
  success: boolean;
  reason: string | null;
  createdAt: string;
};

type LoginLogsResponse = {
  logs: LoginLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const METHOD_OPTIONS = [
  {value: '', labelKey: 'loginHistoryPage.allMethods'},
  {value: 'credentials', labelKey: 'loginHistoryPage.credentials'},
  {value: 'google', labelKey: 'loginHistoryPage.google'},
];

const SUCCESS_OPTIONS = [
  {value: '', labelKey: 'loginHistoryPage.allStatuses'},
  {value: 'true', labelKey: 'loginHistoryPage.success'},
  {value: 'false', labelKey: 'loginHistoryPage.failed'},
];

export default function AdminLoginHistoryPage() {
  const t = useTranslations('Admin');
  const [data, setData] = useState<LoginLogsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('');
  const [success, setSuccess] = useState('');

  const fetchLogs = useCallback(
    async (p: number, q: string, m: string, s: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({page: String(p)});
        if (q) params.set('search', q);
        if (m) params.set('method', m);
        if (s) params.set('success', s);
        const res = await fetch(`/api/admin/login-logs?${params.toString()}`);
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
    fetchLogs(page, search, method, success);
  }, [page, fetchLogs, search, method, success]);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPage(1);
    fetchLogs(1, search, method, success);
  }

  function handleMethodFilter(e: React.ChangeEvent<HTMLSelectElement>) {
    setMethod(e.target.value);
    setPage(1);
  }

  function handleSuccessFilter(e: React.ChangeEvent<HTMLSelectElement>) {
    setSuccess(e.target.value);
    setPage(1);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/admin"
            className="text-foreground/60 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-white">{t('loginHistoryPage.title')}</h1>
        </div>
        <p className="mt-1 text-foreground/60">
          {t('loginHistoryPage.subtitle')}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            className="flex-1 px-4 py-2 text-sm rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/80 transition-colors"
          >
            {t('searchButton')}
          </button>
        </form>
        <select
          value={method}
          onChange={handleMethodFilter}
          className="px-3 py-2 text-sm rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-primary/50 transition-colors"
        >
          {METHOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.labelKey as never)}
            </option>
          ))}
        </select>
        <select
          value={success}
          onChange={handleSuccessFilter}
          className="px-3 py-2 text-sm rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-primary/50 transition-colors"
        >
          {SUCCESS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.labelKey as never)}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('loginHistoryPage.user')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('loginHistoryPage.method')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('loginHistoryPage.ipAddress')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('status')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('loginHistoryPage.reason')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('loginHistoryPage.time')}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && !data && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-foreground/40">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t('loginHistoryPage.loadingLogs')}
                    </div>
                  </td>
                </tr>
              )}
              {data?.logs.map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-3">
                    <div>
                      <div className="text-foreground">
                        {log.name ?? '\u2014'}
                      </div>
                      <div className="text-xs text-foreground/50">
                        {log.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-foreground/10 text-foreground/60 capitalize">
                      {log.method}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-foreground/60 font-mono text-xs">
                    {log.ip ?? '\u2014'}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        log.success
                          ? 'bg-green-500/15 text-green-400'
                          : 'bg-red-500/15 text-red-400'
                      }`}
                    >
                      {log.success ? t('loginHistoryPage.success') : t('loginHistoryPage.failed')}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-foreground/60 max-w-[200px] truncate">
                    {log.reason ?? '\u2014'}
                  </td>
                  <td className="px-6 py-3 text-foreground/60">
                    {new Date(log.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
              {data && data.logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-foreground/40">
                    {t('loginHistoryPage.noLogs')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
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

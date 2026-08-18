'use client';

import {useEffect, useState, useCallback} from 'react';
import {Link} from '@/i18n/navigation';
import {useTranslations} from 'next-intl';

type Annotation = {
  id: string;
  entityType: string;
  entityId: string;
  status: string;
  rating: number | null;
  notes: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
};

type AnnotationsResponse = {
  annotations: Annotation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const STATUS_OPTIONS = [
  {value: '', labelKey: 'allStatuses'},
  {value: 'WATCHED', label: 'Watched'},
  {value: 'WATCHING', label: 'Watching'},
  {value: 'WANT_TO_WATCH', label: 'Want to Watch'},
  {value: 'DROPPED', label: 'Dropped'},
];

const ENTITY_TYPE_OPTIONS = [
  {value: '', labelKey: 'allTypes'},
  {value: 'MOVIE', label: 'Movie'},
  {value: 'TV', label: 'TV'},
  {value: 'PERSON', label: 'Person'},
];

export default function AdminAnnotationsPage() {
  const t = useTranslations('Admin');
  const [data, setData] = useState<AnnotationsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [entityType, setEntityType] = useState('');

  const fetchAnnotations = useCallback(
    async (p: number, statusFilter: string, typeFilter: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({page: String(p)});
        if (statusFilter) params.set('status', statusFilter);
        if (typeFilter) params.set('entityType', typeFilter);
        const res = await fetch(`/api/admin/annotations?${params.toString()}`);
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
    fetchAnnotations(page, status, entityType);
  }, [page, fetchAnnotations, status, entityType]);

  function handleStatusFilter(e: React.ChangeEvent<HTMLSelectElement>) {
    setStatus(e.target.value);
    setPage(1);
  }

  function handleEntityTypeFilter(e: React.ChangeEvent<HTMLSelectElement>) {
    setEntityType(e.target.value);
    setPage(1);
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
          <h1 className="text-3xl font-bold text-white">{t('annotationsPage.title')}</h1>
        </div>
        <p className="mt-1 text-foreground/60">
          {t('annotationsPage.subtitle')}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={status}
          onChange={handleStatusFilter}
          className="px-3 py-2 text-sm rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-primary/50 transition-colors"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.labelKey ? t(`annotationsPage.${opt.labelKey}`) : opt.label}
            </option>
          ))}
        </select>
        <select
          value={entityType}
          onChange={handleEntityTypeFilter}
          className="px-3 py-2 text-sm rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-primary/50 transition-colors"
        >
          {ENTITY_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.labelKey ? t(`annotationsPage.${opt.labelKey}`) : opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Annotations Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('annotationsPage.user')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('annotationsPage.type')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('annotationsPage.entityId')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('annotationsPage.status')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('annotationsPage.rating')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('annotationsPage.notes')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('annotationsPage.created')}
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
                      {t('loadingAnnotations')}
                    </div>
                  </td>
                </tr>
              )}
              {data?.annotations.map((annotation) => (
                <tr
                  key={annotation.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-6 py-3">
                    <div>
                      <div className="text-foreground">
                        {annotation.user.name ?? '—'}
                      </div>
                      <div className="text-xs text-foreground/50">
                        {annotation.user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-foreground/10 text-foreground/60">
                      {annotation.entityType}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-foreground/70 font-mono text-xs">
                    {annotation.entityId}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        annotation.status === 'WATCHED'
                          ? 'bg-green-500/15 text-green-400'
                          : annotation.status === 'WATCHING'
                            ? 'bg-blue-500/15 text-blue-400'
                            : annotation.status === 'WANT_TO_WATCH'
                              ? 'bg-yellow-500/15 text-yellow-400'
                              : 'bg-red-500/15 text-red-400'
                      }`}
                    >
                      {annotation.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-foreground/70">
                    {annotation.rating ?? '—'}
                  </td>
                  <td className="px-6 py-3 text-foreground/60 max-w-[200px] truncate">
                    {annotation.notes ?? '—'}
                  </td>
                  <td className="px-6 py-3 text-foreground/60">
                    {new Date(annotation.createdAt).toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      },
                    )}
                  </td>
                </tr>
              ))}
              {data && data.annotations.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-foreground/40"
                  >
                    {t('annotationsPage.noAnnotations')}
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

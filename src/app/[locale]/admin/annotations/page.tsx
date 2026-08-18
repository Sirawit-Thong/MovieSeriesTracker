'use client';

import {useEffect, useState, useCallback} from 'react';
import {Link} from '@/i18n/navigation';
import {useLocale, useTranslations} from 'next-intl';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminSpinner from '@/components/admin/AdminSpinner';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import ConfirmButton from '@/components/admin/ConfirmButton';
import {formatDate} from '@/lib/format-date';

type Annotation = {
  id: string;
  entityType: string;
  entityId: number;
  watchStatus: string | null;
  personalRating: number | null;
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

const STATUS_OPTIONS: {value: string; labelKey: string}[] = [
  {value: '', labelKey: 'allStatuses'},
  {value: 'WATCHED', labelKey: 'watched'},
  {value: 'WATCHING', labelKey: 'watching'},
  {value: 'WANT_TO_WATCH', labelKey: 'wantToWatch'},
  {value: 'DROPPED', labelKey: 'dropped'},
];

const ENTITY_TYPE_OPTIONS: {value: string; labelKey: string}[] = [
  {value: '', labelKey: 'allTypes'},
  {value: 'MOVIE', labelKey: 'movie'},
  {value: 'TV', labelKey: 'tv'},
  {value: 'PERSON', labelKey: 'person'},
];

export default function AdminAnnotationsPage() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const [data, setData] = useState<AnnotationsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [entityType, setEntityType] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchAnnotations = useCallback(
    async (p: number, statusFilter: string, typeFilter: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({page: String(p)});
        if (statusFilter) params.set('status', statusFilter);
        if (typeFilter) params.set('entityType', typeFilter);
        const res = await fetch(`/api/admin/annotations?${params.toString()}`);
        if (res.ok) {
          const nextData: AnnotationsResponse = await res.json();
          setData(nextData);
          setError(null);
          return nextData;
        }
        setError(t('loadError'));
        return null;
      } catch {
        setError(t('loadError'));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [t],
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
              {t(`annotationsPage.${opt.labelKey}`)}
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
              {t(`annotationsPage.${opt.labelKey}`)}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg">
          {error}
        </div>
      )}

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
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && !data && (
                <tr>
                  <td colSpan={8}>
                    <AdminSpinner label={t('loadingAnnotations')} />
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
                  <td className="px-6 py-3">
                    {annotation.entityType === 'MOVIE' && (
                      <Link href={`/movie/${annotation.entityId}`} className="text-primary hover:underline font-mono text-xs">
                        {annotation.entityId}
                      </Link>
                    )}
                    {annotation.entityType === 'TV' && (
                      <Link href={`/tv/${annotation.entityId}`} className="text-primary hover:underline font-mono text-xs">
                        {annotation.entityId}
                      </Link>
                    )}
                    {annotation.entityType === 'PERSON' && (
                      <Link href={`/person/${annotation.entityId}`} className="text-primary hover:underline font-mono text-xs">
                        {annotation.entityId}
                      </Link>
                    )}
                    {!['MOVIE', 'TV', 'PERSON'].includes(annotation.entityType) && (
                      <span className="font-mono text-xs text-foreground/70">{annotation.entityId}</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        annotation.watchStatus === 'WATCHED'
                          ? 'bg-green-500/15 text-green-400'
                          : annotation.watchStatus === 'WATCHING'
                            ? 'bg-blue-500/15 text-blue-400'
                            : annotation.watchStatus === 'WANT_TO_WATCH'
                              ? 'bg-yellow-500/15 text-yellow-400'
                              : 'bg-red-500/15 text-red-400'
                      }`}
                    >
                      {annotation.watchStatus}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-foreground/70">
                    {annotation.personalRating ?? '—'}
                  </td>
                  <td className="px-6 py-3 text-foreground/60 max-w-[200px] truncate">
                    {annotation.notes ?? '—'}
                  </td>
                  <td className="px-6 py-3 text-foreground/60">
                    {formatDate(annotation.createdAt, locale)}
                  </td>
                  <td className="px-6 py-3">
                    <ConfirmButton
                      onConfirm={async () => {
                        try {
                          const res = await fetch(`/api/admin/annotations?id=${annotation.id}`, {method: 'DELETE'});
                          if (res.ok) {
                            const next = await fetchAnnotations(page, status, entityType);
                            if (next && page > next.totalPages) setPage(Math.max(1, next.totalPages));
                          } else {
                            setError(t('annotationsPage.deleteError'));
                          }
                        } catch {
                          setError(t('annotationsPage.deleteError'));
                        }
                      }}
                      confirmLabel={t('annotationsPage.confirmDelete')}
                    >
                      {t('annotationsPage.delete')}
                    </ConfirmButton>
                  </td>
                </tr>
              ))}
              {data && data.annotations.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <AdminEmptyState message={t('annotationsPage.noAnnotations')} />
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
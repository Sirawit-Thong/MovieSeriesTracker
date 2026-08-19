'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

type EntityOption = 'all' | 'movies' | 'tv' | 'persons';

type SyncResult = {
  success: boolean;
  message?: string;
  cancelled?: boolean;
  completedAt?: string;
  results?: Record<
    string,
    { success: boolean; processed: number; errors: number; duration: number }
  >;
};

export default function SyncPanel() {
  const t = useTranslations('Admin');
  const [entity, setEntity] = useState<EntityOption>('all');
  const [limit, setLimit] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [syncRunning, setSyncRunning] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch('/api/admin/sync/status');
        if (!res.ok) return;
        const data: { running: boolean } = await res.json();
        if (cancelled) return;
        setSyncRunning(!!data.running);
        if (!data.running) setStopping(false);
      } catch {
        // silent — keep the last known state
      }
    };
    check();
    const interval = setInterval(check, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const entityOptions: { value: EntityOption; label: string }[] = [
    { value: 'all', label: t('syncPanel.all') },
    { value: 'movies', label: t('stats.movies') },
    { value: 'tv', label: t('stats.tvSeries') },
    { value: 'persons', label: t('stats.persons') },
  ];

  async function handleSync() {
    const entityLabel = entity === 'all' ? t('syncPanel.allData') : entity;
    if (!confirm(t('syncPanel.confirmMessage', { entity: entityLabel }))) {
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const body: Record<string, unknown> = { entity };
      if (limit && Number(limit) > 0) {
        body.limit = Number(limit);
      }

      const res = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `Sync failed (${res.status})`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('syncPanel.networkError'));
    } finally {
      setLoading(false);
    }
  }

  async function handleStop() {
    setStopping(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/sync/stop', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? t('syncPanel.stopError'));
        setStopping(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('syncPanel.networkError'));
      setStopping(false);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white">{t('syncPanel.title')}</h2>
      <p className="mt-1 text-sm text-foreground/60">{t('syncPanel.subtitle')}</p>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <label
            htmlFor="entity-select"
            className="block text-xs font-medium text-foreground/50 mb-1"
          >
            {t('syncPanel.entity')}
          </label>
          <select
            id="entity-select"
            value={entity}
            onChange={(e) => setEntity(e.target.value as EntityOption)}
            disabled={loading || syncRunning}
            className="px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
          >
            {entityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="limit-input"
            className="block text-xs font-medium text-foreground/50 mb-1"
          >
            {t('syncPanel.limit')}
          </label>
          <input
            id="limit-input"
            type="number"
            min="0"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            disabled={loading || syncRunning}
            placeholder="0"
            className="w-24 px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
          />
        </div>

        <button
          type="button"
          onClick={handleSync}
          disabled={loading || syncRunning}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {loading || syncRunning ? t('syncPanel.syncing') : t('syncPanel.syncNow')}
        </button>

        {(loading || syncRunning) && (
          <button
            type="button"
            onClick={handleStop}
            disabled={stopping}
            className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {stopping ? t('syncPanel.stopping') : t('syncPanel.stop')}
          </button>
        )}
      </div>

      {/* Status messages */}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {result && (
        <div className="mt-4 space-y-2">
          <p className={`text-sm ${result.cancelled ? 'text-yellow-400' : 'text-green-400'}`}>
            {result.message ?? t('syncPanel.completed')} {t('syncPanel.at')}{' '}
            {result.completedAt ? new Date(result.completedAt).toLocaleTimeString() : ''}
          </p>
          {result.results && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              {Object.entries(result.results).map(([key, r]) => (
                <div
                  key={key}
                  className="bg-background border border-border rounded-lg p-3 text-sm"
                >
                  <p className="font-medium text-foreground capitalize">{key}</p>
                  <p className="text-foreground/60 mt-1">
                    {t('syncPanel.processed')}: {r.processed} | {t('syncPanel.errorCount')}:{' '}
                    {r.errors} | {t('syncPanel.duration')}: {(r.duration / 1000).toFixed(1)}s
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {result && (
        <Link
          href="/admin/sync-history"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          {t('syncPanel.viewHistory')}
        </Link>
      )}
    </div>
  );
}

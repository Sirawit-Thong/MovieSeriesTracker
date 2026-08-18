'use client';

import {useState} from 'react';

type EntityOption = 'all' | 'movies' | 'tv' | 'persons';

const ENTITY_OPTIONS: {value: EntityOption; label: string}[] = [
  {value: 'all', label: 'All'},
  {value: 'movies', label: 'Movies'},
  {value: 'tv', label: 'TV Series'},
  {value: 'persons', label: 'Persons'},
];

type SyncResult = {
  success: boolean;
  message?: string;
  completedAt?: string;
  results?: Record<string, {success: boolean; processed: number; errors: number; duration: number}>;
};

export default function SyncPanel() {
  const [entity, setEntity] = useState<EntityOption>('all');
  const [limit, setLimit] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSync() {
    if (!confirm(`Start syncing ${entity === 'all' ? 'all data' : entity}? This may take several minutes.`)) {
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const body: Record<string, unknown> = {entity};
      if (limit && Number(limit) > 0) {
        body.limit = Number(limit);
      }

      const res = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
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
      setError(e instanceof Error ? e.message : 'Network error — sync may still be running in the background');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white">TMDB Sync</h2>
      <p className="mt-1 text-sm text-foreground/60">
        Trigger a manual sync with The Movie Database.
      </p>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="entity-select" className="block text-xs font-medium text-foreground/50 mb-1">
            Entity
          </label>
          <select
            id="entity-select"
            value={entity}
            onChange={(e) => setEntity(e.target.value as EntityOption)}
            disabled={loading}
            className="px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
          >
            {ENTITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="limit-input" className="block text-xs font-medium text-foreground/50 mb-1">
            Limit (0 = all)
          </label>
          <input
            id="limit-input"
            type="number"
            min="0"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            disabled={loading}
            placeholder="0"
            className="w-24 px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
          />
        </div>

        <button
          type="button"
          onClick={handleSync}
          disabled={loading}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {/* Status messages */}
      {error && (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      )}

      {result && (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-green-400">
            {result.message ?? 'Sync completed'} at {result.completedAt ? new Date(result.completedAt).toLocaleTimeString() : ''}
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
                    Processed: {r.processed} | Errors: {r.errors} | Duration: {(r.duration / 1000).toFixed(1)}s
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

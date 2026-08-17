'use client';

import {useState} from 'react';

export default function SyncPanel() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSync() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/sync', {method: 'POST'});
      if (res.ok) {
        const data = await res.json();
        setStatus(data.message ?? 'Sync completed');
      } else {
        setStatus('Sync failed');
      }
    } catch {
      setStatus('Sync failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">TMDB Sync</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Trigger a manual sync with The Movie Database.
          </p>
          {status && <p className="mt-2 text-sm text-primary">{status}</p>}
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
    </div>
  );
}

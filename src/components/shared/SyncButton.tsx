'use client';

import {useState, useCallback} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {useRouter} from '@/i18n/navigation';

type SyncButtonProps = {
  type: 'movie' | 'tv' | 'person';
  tmdbId: number;
};

export default function SyncButton({type, tmdbId}: SyncButtonProps) {
  const t = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [done, setDone] = useState(false);

  const handleSync = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    setDone(false);

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({type, tmdbId, locale}),
      });

      if (res.ok) {
        setDone(true);
        router.refresh();
        setTimeout(() => setDone(false), 2000);
      }
    } catch {
      // silent
    } finally {
      setSyncing(false);
    }
  }, [syncing, type, tmdbId, locale, router]);

  return (
    <button
      type="button"
      onClick={handleSync}
      disabled={syncing}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
        border border-border bg-surface hover:bg-surface-hover text-foreground/70 hover:text-white
        disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      title={t('syncData')}
    >
      {syncing ? (
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : done ? (
        <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )}
      {t('syncData')}
    </button>
  );
}

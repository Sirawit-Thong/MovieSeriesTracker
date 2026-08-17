'use client';

import {useState, useEffect, useCallback} from 'react';
import {useTranslations} from 'next-intl';
import WatchStatusButton from './WatchStatusButton';
import PersonalRating from './PersonalRating';
import UserNotes from './UserNotes';

type WatchStatus = 'WATCHED' | 'WATCHING' | 'WANT_TO_WATCH' | 'DROPPED';

type AnnotationData = {
  id: number;
  entityType: string;
  entityId: number;
  watchStatus: WatchStatus | null;
  personalRating: number | null;
  currentEpisode: number | null;
  totalEpisodes: number | null;
  notes: string | null;
  watchDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type AnnotationPanelProps = {
  entityType: 'MOVIE' | 'TV' | 'PERSON';
  entityId: number;
};

export default function AnnotationPanel({entityType, entityId}: AnnotationPanelProps) {
  const t = useTranslations();
  const [annotation, setAnnotation] = useState<AnnotationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSavingEpisode, setIsSavingEpisode] = useState(false);

  // Fetch existing annotation on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchAnnotation() {
      try {
        const res = await fetch(
          `/api/annotations?entityType=${entityType}&entityId=${entityId}`
        );
        if (!res.ok) throw new Error('Failed to fetch annotation');
        const data = await res.json();
        if (!cancelled) {
          setAnnotation(data);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load annotations');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchAnnotation();
    return () => { cancelled = true; };
  }, [entityType, entityId]);

  // Optimistic update helpers
  const handleStatusChange = useCallback((status: WatchStatus | null) => {
    setAnnotation((prev) =>
      prev ? {...prev, watchStatus: status} : prev
    );
  }, []);

  const handleRatingChange = useCallback((rating: number | null) => {
    setAnnotation((prev) =>
      prev ? {...prev, personalRating: rating} : prev
    );
  }, []);

  const handleNotesChange = useCallback((notes: string | null) => {
    setAnnotation((prev) =>
      prev ? {...prev, notes} : prev
    );
  }, []);

  // Episode tracking (for TV only)
  const handleEpisodeChange = useCallback(async (field: 'currentEpisode' | 'totalEpisodes', value: number | null) => {
    setAnnotation((prev) =>
      prev ? {...prev, [field]: value} : prev
    );
    setIsSavingEpisode(true);
    try {
      await fetch('/api/annotations', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          entityType,
          entityId,
          [field]: value,
        }),
      });
    } catch {
      // Revert on failure
      setAnnotation((prev) => {
        if (!prev) return prev;
        return {...prev, [field]: prev[field]};
      });
    } finally {
      setIsSavingEpisode(false);
    }
  }, [entityType, entityId]);

  if (isLoading) {
    return (
      <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-foreground/10 rounded w-1/3" />
          <div className="h-10 bg-foreground/10 rounded" />
          <div className="h-4 bg-foreground/10 rounded w-1/4" />
          <div className="h-16 bg-foreground/10 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface rounded-lg border border-border p-6">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-border p-6 space-y-5">
      <WatchStatusButton
        entityType={entityType}
        entityId={entityId}
        initialStatus={annotation?.watchStatus ?? null}
        onStatusChange={handleStatusChange}
      />

      <PersonalRating
        entityType={entityType}
        entityId={entityId}
        initialRating={annotation?.personalRating ?? null}
        onRatingChange={handleRatingChange}
      />

      {/* Episode tracking — TV only */}
      {entityType === 'TV' && (
        <div className="space-y-2">
          <span className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider">
            {t('annotation.episodeTracking')}
          </span>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-foreground/40 mb-1">
                {t('annotation.currentEpisode')}
              </label>
              <input
                type="number"
                min={0}
                value={annotation?.currentEpisode ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                  handleEpisodeChange('currentEpisode', val);
                }}
                disabled={isSavingEpisode}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm
                  focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-foreground/40 mb-1">
                {t('annotation.totalEpisodes')}
              </label>
              <input
                type="number"
                min={0}
                value={annotation?.totalEpisodes ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                  handleEpisodeChange('totalEpisodes', val);
                }}
                disabled={isSavingEpisode}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm
                  focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              />
            </div>
          </div>
          {annotation?.currentEpisode != null && annotation?.totalEpisodes != null && annotation.totalEpisodes > 0 && (
            <div className="mt-2">
              <div className="w-full bg-foreground/10 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{width: `${Math.min(100, (annotation.currentEpisode / annotation.totalEpisodes) * 100)}%`}}
                />
              </div>
              <p className="text-xs text-foreground/40 mt-1">
                {annotation.currentEpisode} / {annotation.totalEpisodes} ({Math.round((annotation.currentEpisode / annotation.totalEpisodes) * 100)}%)
              </p>
            </div>
          )}
        </div>
      )}

      <UserNotes
        entityType={entityType}
        entityId={entityId}
        initialNotes={annotation?.notes ?? ''}
        onNotesChange={handleNotesChange}
      />
    </div>
  );
}

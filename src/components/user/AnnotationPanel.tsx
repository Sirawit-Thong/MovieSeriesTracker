'use client';

import {useState, useEffect, useCallback} from 'react';
import {useSession} from 'next-auth/react';
import PersonalRating from './PersonalRating';
import UserNotes from './UserNotes';

type AnnotationData = {
  id: number;
  entityType: string;
  entityId: number;
  watchStatus: string | null;
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
  const [annotation, setAnnotation] = useState<AnnotationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {status} = useSession();

  useEffect(() => {
    if (status !== 'authenticated') return;
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
      }
    }

    fetchAnnotation();
    return () => { cancelled = true; };
  }, [status, entityType, entityId]);

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

  if (status === 'loading') {
    return (
      <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-foreground/10 rounded w-1/3" />
          <div className="h-10 bg-foreground/10 rounded" />
          <div className="h-16 bg-foreground/10 rounded" />
        </div>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return null;
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
      <PersonalRating
        entityType={entityType}
        entityId={entityId}
        initialRating={annotation?.personalRating ?? null}
        onRatingChange={handleRatingChange}
      />

      <UserNotes
        entityType={entityType}
        entityId={entityId}
        initialNotes={annotation?.notes ?? ''}
        onNotesChange={handleNotesChange}
      />
    </div>
  );
}

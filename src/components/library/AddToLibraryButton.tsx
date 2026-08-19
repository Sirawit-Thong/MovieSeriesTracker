'use client';

import {useCallback, useEffect, useState} from 'react';
import {useSession} from 'next-auth/react';
import {useTranslations} from 'next-intl';

type Annotation = {
  id: number;
  entityType: string;
  entityId: number;
  watchStatus: string | null;
  personalRating: number | null;
};

type AddToLibraryButtonProps = {
  entityType: 'MOVIE' | 'TV';
  /** Internal DB entity ID (the movie/TV series id from our database) */
  entityId: number;
};

const STATUS_OPTIONS = [
  {value: 'WANT_TO_WATCH', labelKey: 'wantToWatch', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'},
  {value: 'WATCHING', labelKey: 'watching', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'},
  {value: 'WATCHED', labelKey: 'watched', color: 'bg-green-500/20 text-green-400 border-green-500/30'},
  {value: 'DROPPED', labelKey: 'dropped', color: 'bg-red-500/20 text-red-400 border-red-500/30'},
] as const;

export default function AddToLibraryButton({entityType, entityId}: AddToLibraryButtonProps) {
  const t = useTranslations('Library');
  const tAnnotation = useTranslations('annotation');
  const {data: session} = useSession();

  const [annotation, setAnnotation] = useState<Annotation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Render-time adjustment (React-sanctioned — no setState in effects):
  // when the session resolves/changes, loading follows the login state.
  // Logged-out → done loading; logged-in → initial library check starts.
  const hasUser = !!session?.user;
  const [prevHasUser, setPrevHasUser] = useState(false);
  if (prevHasUser !== hasUser) {
    setPrevHasUser(hasUser);
    setIsLoading(hasUser);
  }

  // Pure fetch — no setState; returns the annotation or null (not found/error)
  const checkAnnotation = useCallback(async (): Promise<Annotation | null> => {
    try {
      const res = await fetch(
        `/api/annotations?entityType=${entityType}&entityId=${entityId}`
      );
      if (!res.ok) return null;
      return (await res.json()) as Annotation;
    } catch {
      return null;
    }
  }, [entityType, entityId]);

  // Check if already in library
  useEffect(() => {
    if (!session?.user) return;

    let cancelled = false;

    checkAnnotation()
      .then((data) => {
        if (!cancelled && data !== null) {
          setAnnotation(data);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session, checkAnnotation]);

  const addToLibrary = useCallback(async (status: string = 'WANT_TO_WATCH') => {
    if (!session?.user) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/annotations', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          entityType,
          entityId,
          watchStatus: status,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnnotation(data);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
      }
    } catch {
      // Ignore errors
    } finally {
      setIsSaving(false);
      setShowDropdown(false);
    }
  }, [session, entityType, entityId]);

  const changeStatus = useCallback(async (newStatus: string) => {
    if (!session?.user || !annotation) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/annotations/${annotation.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          watchStatus: newStatus,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnnotation(data);
      }
    } catch {
      // Ignore errors
    } finally {
      setIsSaving(false);
      setShowDropdown(false);
    }
  }, [session, annotation]);

  const removeFromLibrary = useCallback(async () => {
    if (!session?.user || !annotation) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/annotations/${annotation.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAnnotation(null);
      }
    } catch {
      // Ignore errors
    } finally {
      setIsSaving(false);
      setShowDropdown(false);
    }
  }, [session, annotation]);

  // Don't show for non-logged-in users
  if (!session?.user) return null;

  // Loading state
  if (isLoading) {
    return (
      <div className="h-10 w-36 bg-surface animate-pulse rounded-lg border border-border" />
    );
  }

  // Not in library — show "Add to My Library" button
  if (!annotation) {
    return (
      <button
        type="button"
        onClick={() => addToLibrary('WANT_TO_WATCH')}
        disabled={isSaving}
        className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        {isSaving ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )}
        {justAdded ? t('added') : t('addToLibrary')}
      </button>
    );
  }

  // In library — show status badge with dropdown
  const currentStatus = STATUS_OPTIONS.find((s) => s.value === annotation.watchStatus) ?? STATUS_OPTIONS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isSaving}
        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 ${currentStatus.color}`}
      >
        {isSaving ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
        {tAnnotation(currentStatus.labelKey as 'watched' | 'watching' | 'wantToWatch' | 'dropped')}
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          {/* Dropdown */}
          <div className="absolute left-0 mt-1 w-56 bg-surface border border-border rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-1">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => changeStatus(option.value)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    option.value === annotation.watchStatus
                      ? `${option.color} font-medium`
                      : 'text-foreground/70 hover:bg-surface-hover hover:text-foreground'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{
                    backgroundColor: option.value === 'WATCHED' ? '#22c55e'
                      : option.value === 'WATCHING' ? '#eab308'
                      : option.value === 'WANT_TO_WATCH' ? '#3b82f6'
                      : '#ef4444'
                  }} />
                  {tAnnotation(option.labelKey as 'watched' | 'watching' | 'wantToWatch' | 'dropped')}
                </button>
              ))}
            </div>
            <div className="border-t border-border p-1">
              <button
                type="button"
                onClick={removeFromLibrary}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {t('removeFromLibrary')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

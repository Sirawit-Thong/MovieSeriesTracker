'use client';

import {useState, useCallback} from 'react';
import {useTranslations} from 'next-intl';

type PersonalRatingProps = {
  entityType: 'MOVIE' | 'TV' | 'PERSON';
  entityId: number;
  initialRating?: number | null;
  onRatingChange?: (rating: number | null) => void;
};

export default function PersonalRating({
  entityType,
  entityId,
  initialRating = null,
  onRatingChange,
}: PersonalRatingProps) {
  const t = useTranslations();
  const [rating, setRating] = useState<number | null>(initialRating);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const saveRating = useCallback(
    async (newRating: number | null) => {
      setIsSaving(true);
      try {
        await fetch('/api/annotations', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({entityType, entityId, personalRating: newRating}),
        });
      } catch {
        // Revert on failure
        setRating(rating);
        onRatingChange?.(rating);
      } finally {
        setIsSaving(false);
      }
    },
    [entityType, entityId, rating, onRatingChange]
  );

  function handleRatingClick(value: number) {
    // Click same value to remove
    const newRating = rating === value ? null : value;
    setRating(newRating);
    onRatingChange?.(newRating);
    saveRating(newRating);
  }

  const displayRating = hoverRating ?? rating;

  return (
    <div>
      <span className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">
        {t('annotation.rating')}
      </span>

      <div className="flex items-center gap-1.5">
        {/* Star buttons 1-10 */}
        <div className="flex items-center gap-0.5">
          {Array.from({length: 10}, (_, i) => i + 1).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleRatingClick(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(null)}
              disabled={isSaving}
              className={`w-6 h-6 flex items-center justify-center rounded transition-all
                ${isSaving ? 'cursor-wait' : 'cursor-pointer'}
                ${
                  displayRating !== null && value <= displayRating
                    ? 'text-yellow-400 scale-110'
                    : 'text-foreground/20 hover:text-foreground/40'
                }`}
              aria-label={`${value}/10`}
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>

        {/* Numerical display */}
        <span
          className={`ml-2 text-sm font-semibold tabular-nums transition-colors ${
            displayRating !== null ? 'text-yellow-400' : 'text-foreground/30'
          }`}
        >
          {displayRating !== null ? `${displayRating}/10` : '—'}
        </span>
      </div>
    </div>
  );
}

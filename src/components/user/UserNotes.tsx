'use client';

import {useState, useRef, useEffect, useCallback} from 'react';
import {useTranslations} from 'next-intl';

type UserNotesProps = {
  entityType: 'MOVIE' | 'TV' | 'PERSON';
  entityId: number;
  initialNotes?: string | null;
  onNotesChange?: (notes: string | null) => void;
};

const MAX_CHARACTERS = 2000;

export default function UserNotes({
  entityType,
  entityId,
  initialNotes = '',
  onNotesChange,
}: UserNotesProps) {
  const t = useTranslations();
  const [notes, setNotes] = useState<string>(initialNotes ?? '');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
    };
  }, []);

  const saveNotes = useCallback(
    async (value: string) => {
      setIsSaving(true);
      try {
        const trimmed = value.trim();
        await fetch('/api/annotations', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            entityType,
            entityId,
            notes: trimmed.length > 0 ? trimmed : null,
          }),
        });
        setShowSaved(true);
        if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
        savedTimeoutRef.current = setTimeout(() => setShowSaved(false), 2000);
        onNotesChange?.(trimmed.length > 0 ? trimmed : null);
      } catch {
        // Notes remain as-is on failure
      } finally {
        setIsSaving(false);
      }
    },
    [entityType, entityId, onNotesChange]
  );

  function handleBlur() {
    saveNotes(notes);
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    if (value.length <= MAX_CHARACTERS) {
      setNotes(value);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Allow Cmd/Ctrl+Enter to save immediately
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      saveNotes(notes);
      textareaRef.current?.blur();
    }
  }

  const characterCount = notes.length;
  const isNearLimit = characterCount > MAX_CHARACTERS * 0.9;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">
          {t('annotation.notes')}
        </span>
        <div className="flex items-center gap-2">
          {/* Save indicator */}
          {isSaving && (
            <span className="text-xs text-foreground/40">
              <svg className="w-3 h-3 animate-spin inline-block mr-1" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </span>
          )}
          {showSaved && !isSaving && (
            <span className="text-xs text-green-400 animate-in fade-in">
              {t('annotation.saved')} ✓
            </span>
          )}
          {/* Expand toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-foreground/40 hover:text-foreground/60 transition-colors"
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={t('annotation.notes')}
          rows={isExpanded ? 8 : 3}
          className={`w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm
            text-foreground/90 placeholder:text-foreground/30 resize-none transition-all
            focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30
            ${isSaving ? 'opacity-70' : ''}`}
        />

        {/* Character count */}
        <div className="flex items-center justify-between mt-1 px-1">
          <span className="text-xs text-foreground/30">
            {characterCount}/{MAX_CHARACTERS}
          </span>
          {isNearLimit && (
            <span className={`text-xs ${characterCount >= MAX_CHARACTERS ? 'text-red-400' : 'text-yellow-400'}`}>
              {MAX_CHARACTERS - characterCount} remaining
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

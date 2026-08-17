'use client';

import {useEffect, useRef, useState, useCallback} from 'react';
import {useTranslations} from 'next-intl';

type SearchBarProps = {
  /** Current search query value. */
  value: string;
  /** Called when the debounced value changes. */
  onSearch: (query: string) => void;
  /** Whether results are currently loading. */
  isLoading?: boolean;
};

/**
 * Search input with debounced onChange, clear button, and auto-focus.
 * Renders a full-width search bar with an icon and clear affordance.
 */
export default function SearchBar({
  value,
  onSearch,
  isLoading = false,
}: SearchBarProps) {
  const t = useTranslations('Search');
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(value);

  // Sync local value when external value changes (e.g., URL navigation)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce the search callback (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onSearch(localValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, value, onSearch]);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onSearch('');
    inputRef.current?.focus();
  }, [onSearch]);

  return (
    <div className="relative w-full">
      {/* Search icon */}
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg
          className="w-5 h-5 text-foreground/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={t('placeholder')}
        className="w-full pl-12 pr-12 py-4 bg-surface border border-border rounded-xl text-foreground text-lg placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
        aria-label={t('placeholder')}
      />

      {/* Loading spinner or clear button */}
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
        {isLoading && localValue ? (
          <svg
            className="w-5 h-5 text-foreground/40 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : localValue ? (
          <button
            onClick={handleClear}
            className="p-1 text-foreground/40 hover:text-foreground transition-colors rounded-md"
            aria-label="Clear search"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}

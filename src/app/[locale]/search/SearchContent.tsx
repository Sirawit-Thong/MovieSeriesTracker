'use client';

import {useCallback, useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {useSearchParams} from 'next/navigation';
import SearchBar from '@/components/search/SearchBar';
import SearchResults, {type SearchResultsData} from '@/components/search/SearchResults';

/**
 * Client-side search content with debounced input, URL sync,
 * and results fetched from the /api/search endpoint.
 *
 * Debouncing is handled by SearchBar (300ms). This component receives
 * the already-debounced value via onSearch and drives URL + API from there.
 */
export default function SearchContent() {
  const t = useTranslations('Search');
  const searchParams = useSearchParams();

  // Read initial query from URL
  const initialQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResultsData | null>(null);
  // Start loading when arriving with a query in the URL (initial fetch in flight)
  const [isLoading, setIsLoading] = useState(initialQuery !== '');
  const [prevQuery, setPrevQuery] = useState(initialQuery);

  // Render-time adjustments (React-sanctioned — no setState in effects):
  // - when the query changes, reflect the new loading state immediately
  // - when the query is cleared, drop stale results
  if (prevQuery !== query) {
    setPrevQuery(query);
    setIsLoading(query !== '');
  }
  if (!query && results !== null) {
    setResults(null);
  }

  // Sync URL when query changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) {
      params.set('q', query);
    }
    const newUrl = query
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [query]);

  // Pure fetch — no setState, no hooks; returns data or null on failure
  const fetchResults = useCallback(
    async (q: string): Promise<SearchResultsData | null> => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) return null;
        return (await res.json()) as SearchResultsData;
      } catch {
        return null;
      }
    },
    []
  );

  // Fetch results when query changes
  useEffect(() => {
    if (!query) return;

    let cancelled = false;

    fetchResults(query)
      .then((data) => {
        if (!cancelled) {
          setResults(data);
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
  }, [query, fetchResults]);

  // SearchBar already debounces (300ms) before calling onSearch
  const handleSearch = useCallback((value: string) => {
    setQuery(value);
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page title */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
          {t('title')}
        </h1>

        {/* Search bar — full width */}
        <SearchBar
          value={query}
          onSearch={handleSearch}
          isLoading={isLoading}
        />

        {/* Results */}
        <div className="mt-8">
          <SearchResults
            results={results}
            isLoading={isLoading}
            query={query}
          />
        </div>
      </div>
    </div>
  );
}

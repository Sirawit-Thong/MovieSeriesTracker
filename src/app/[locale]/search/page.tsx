import {Suspense} from 'react';
import SearchContent from './SearchContent';

/**
 * Search page — wraps client search content in a Suspense boundary
 * required by Next.js for useSearchParams() in client components.
 */
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="h-10 w-48 bg-surface rounded mb-6 animate-pulse" />
            <div className="h-14 w-full bg-surface rounded-xl animate-pulse" />
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

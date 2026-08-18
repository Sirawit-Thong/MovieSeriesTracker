import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {getTvSeriesList, getAllGenres} from '@/lib/db/media-queries';
import {resolveLocalizedTitles} from '@/lib/db/resolve-localized-titles';
import MediaCard from '@/components/media/MediaCard';

export const dynamic = 'force-dynamic';

export default async function TvSeriesPage({
  params,
  searchParams,
}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<{page?: string; genre?: string}>;
}) {
  const {locale} = await params;
  const {page, genre} = await searchParams;
  setRequestLocale(locale);

  const tNav = await getTranslations({locale, namespace: 'Navigation'});

  const pageSize = 24;
  const currentPage = Math.max(1, Number(page) || 1);
  const offset = (currentPage - 1) * pageSize;
  const genreId = genre ? Number(genre) : undefined;

  const [{items, total}, genres] = await Promise.all([
    getTvSeriesList(pageSize, offset, genreId),
    getAllGenres(),
  ]);
  const totalPages = Math.ceil(total / pageSize);
  const activeGenre = genreId ? genres.find((g) => g.id === genreId) : null;

  // Resolve localized titles
  const localizedTitles = await resolveLocalizedTitles(
    locale,
    items.map((t) => ({tmdbId: t.tmdbId, type: 'tv' as const})),
  );

  const basePath = `/${locale}/tv-series`;

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">
        {activeGenre ? activeGenre.name : tNav('tvSeries')}
      </h1>
      <p className="text-foreground/50 mb-6">
        {total} {tNav('tvSeries').toLowerCase()}
        {activeGenre && (
          <a href={basePath} className="ml-3 text-primary hover:underline text-sm">
            ✕ Clear filter
          </a>
        )}
      </p>

      {/* Genre filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <a
          href={basePath}
          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
            !genreId
              ? 'bg-primary text-white border-primary'
              : 'bg-surface border-border text-foreground/70 hover:text-white hover:bg-surface-hover'
          }`}
        >
          {tNav('tvSeries')}
        </a>
        {genres.map((g) => (
          <a
            key={g.id}
            href={`${basePath}?genre=${g.id}`}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              genreId === g.id
                ? 'bg-primary text-white border-primary'
                : 'bg-surface border-border text-foreground/70 hover:text-white hover:bg-surface-hover'
            }`}
          >
            {g.name}
          </a>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-foreground/70">No TV series found.</p>
          {genreId && (
            <a href={basePath} className="text-primary hover:underline text-sm mt-2 inline-block">
              Clear filter
            </a>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {items.map((tv) => (
              <MediaCard
                key={tv.id}
                tmdbId={tv.tmdbId}
                title={localizedTitles[tv.tmdbId] || tv.name}
                posterPath={tv.posterPath}
                voteAverage={tv.voteAverage}
                type="tv"
                releaseDate={tv.firstAirDate}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {currentPage > 1 && (
                <a
                  href={`${basePath}?page=${currentPage - 1}${genreId ? `&genre=${genreId}` : ''}`}
                  className="px-4 py-2 bg-surface border border-border rounded-lg text-sm text-foreground/70 hover:text-white hover:bg-surface-hover transition-colors"
                >
                  Previous
                </a>
              )}
              <span className="px-4 py-2 text-sm text-foreground/50">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages && (
                <a
                  href={`${basePath}?page=${currentPage + 1}${genreId ? `&genre=${genreId}` : ''}`}
                  className="px-4 py-2 bg-surface border border-border rounded-lg text-sm text-foreground/70 hover:text-white hover:bg-surface-hover transition-colors"
                >
                  Next
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

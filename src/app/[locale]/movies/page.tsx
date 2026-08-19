import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {getMoviesList, getAllGenres, getAllCountries} from '@/lib/db/media-queries';
import {resolveLocalizedTitles} from '@/lib/db/resolve-localized-titles';
import MediaCard from '@/components/media/MediaCard';
import MediaFilterBar from '@/components/media/MediaFilterBar';
import CountryFilterRestore from '@/components/media/CountryFilterRestore';

export const dynamic = 'force-dynamic';

export default async function MoviesPage({
  params,
  searchParams,
}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<{page?: string; genre?: string; country?: string | string[]}>;
}) {
  const {locale} = await params;
  const {page, genre, country} = await searchParams;
  setRequestLocale(locale);

  const tNav = await getTranslations({locale, namespace: 'Navigation'});

  const pageSize = 24;
  const currentPage = Math.min(Math.max(1, Number(page) || 1), 500);
  const offset = (currentPage - 1) * pageSize;
  const genreId = genre ? Number(genre) : undefined;
  const countryCodes = country
    ? Array.isArray(country) ? country : [country]
    : undefined;

  const [{items, total}, genres, countries] = await Promise.all([
    getMoviesList(pageSize, offset, genreId, countryCodes),
    getAllGenres(),
    getAllCountries(),
  ]);
  const totalPages = Math.ceil(total / pageSize);
  const activeGenre = genreId ? genres.find((g) => g.id === genreId) : null;

  // Resolve localized titles
  const localizedTitles = await resolveLocalizedTitles(
    locale,
    items.map((m) => ({tmdbId: m.tmdbId, type: 'movie' as const})),
  );

  const basePath = `/${locale}/movies`;

  // Build pagination href preserving current filters
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (p > 1) params.set('page', String(p));
    if (genreId) params.set('genre', String(genreId));
    countryCodes?.forEach((c) => params.append('country', c));
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ''}`;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 py-8">
      <CountryFilterRestore />
      <h1 className="text-3xl font-bold text-white mb-2">
        {activeGenre ? activeGenre.name : tNav('movies')}
      </h1>
      <p className="text-foreground/50 mb-6">
        {total} {tNav('movies').toLowerCase()}
        {(activeGenre || countryCodes?.length) && (
          <a href={basePath} className="ml-3 text-primary hover:underline text-sm">
            ✕ Clear filters
          </a>
        )}
      </p>

      {/* Genre filter pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <a
          href={basePath}
          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
            !genreId
              ? 'bg-primary text-white border-primary'
              : 'bg-surface border-border text-foreground/70 hover:text-white hover:bg-surface-hover'
          }`}
        >
          {tNav('movies')}
        </a>
        {genres.map((g) => (
          <a
            key={g.id}
            href={`${basePath}?genre=${g.id}${countryCodes?.length ? countryCodes.map((c) => `&country=${c}`).join('') : ''}`}
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

      {/* Country filter */}
      <MediaFilterBar countries={countries} basePath={basePath} />

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-foreground/70">No movies found.</p>
          {(genreId || countryCodes?.length) && (
            <a href={basePath} className="text-primary hover:underline text-sm mt-2 inline-block">
              Clear filters
            </a>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {items.map((movie, index) => (
              <MediaCard
                key={movie.id}
                tmdbId={movie.tmdbId}
                title={localizedTitles[movie.tmdbId] || movie.title}
                posterPath={movie.posterPath}
                voteAverage={movie.voteAverage}
                type="movie"
                releaseDate={movie.releaseDate}
                countryCodes={movie.productionCountries.map((c) => c.iso31661)}
                priority={index < 6}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {currentPage > 1 && (
                <a
                  href={buildPageUrl(currentPage - 1)}
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
                  href={buildPageUrl(currentPage + 1)}
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

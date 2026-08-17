'use client';

import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/** A single movie search result. */
type MovieResult = {
  id: number;
  title: string;
  originalTitle: string;
  posterPath: string | null;
  voteAverage: number | null;
  releaseDate: string | null;
  overview: string | null;
  source?: 'db' | 'tmdb';
};

/** A single TV series search result. */
type TvSeriesResult = {
  id: number;
  name: string;
  originalName: string;
  posterPath: string | null;
  voteAverage: number | null;
  firstAirDate: string | null;
  overview: string | null;
  source?: 'db' | 'tmdb';
};

/** A single person search result. */
type PersonResult = {
  id: number;
  tmdbId: number;
  name: string;
  profilePath: string | null;
  popularity: number | null;
  knownForDepartment: string | null;
  source?: 'db' | 'tmdb';
};

/** Full search results data. */
export type SearchResultsData = {
  movies: MovieResult[];
  tvSeries: TvSeriesResult[];
  persons: PersonResult[];
};

type SearchResultsProps = {
  results: SearchResultsData | null;
  isLoading: boolean;
  query: string;
};

/**
 * Displays search results grouped by entity type.
 * Shows loading spinner, empty state, or categorized result cards.
 */
export default function SearchResults({
  results,
  isLoading,
  query,
}: SearchResultsProps) {
  const t = useTranslations('Search');

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg
          className="w-10 h-10 text-primary animate-spin mb-4"
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
        <p className="text-foreground/50 text-sm">Searching...</p>
      </div>
    );
  }

  // No query yet
  if (!query) {
    return null;
  }

  // No results
  if (
    !results ||
    (results.movies.length === 0 &&
      results.tvSeries.length === 0 &&
      results.persons.length === 0)
  ) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg
          className="w-16 h-16 text-foreground/20 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <p className="text-foreground/50 text-lg">{t('noResults')}</p>
        <p className="text-foreground/30 text-sm mt-1">
          Try different keywords
        </p>
      </div>
    );
  }

  const totalResults =
    results.movies.length +
    results.tvSeries.length +
    results.persons.length;

  return (
    <div className="space-y-10">
      {/* Result count */}
      <p className="text-sm text-foreground/50">
        {totalResults} result{totalResults !== 1 ? 's' : ''} for &ldquo;
        {query}&rdquo;
      </p>

      {/* Movies */}
      {results.movies.length > 0 && (
        <ResultSection title={t('movies')} badge="movie">
          {results.movies.map((movie) => (
            <MovieResultCard key={movie.id} movie={movie} />
          ))}
        </ResultSection>
      )}

      {/* TV Series */}
      {results.tvSeries.length > 0 && (
        <ResultSection title={t('tvSeries')} badge="tv">
          {results.tvSeries.map((series) => (
            <TvSeriesResultCard key={series.id} series={series} />
          ))}
        </ResultSection>
      )}

      {/* People */}
      {results.persons.length > 0 && (
        <ResultSection title={t('people')} badge="person">
          {results.persons.map((person) => (
            <PersonResultCard key={person.id} person={person} />
          ))}
        </ResultSection>
      )}
    </div>
  );
}

// ============================================================
// Section Wrapper
// ============================================================

type ResultSectionProps = {
  title: string;
  badge: 'movie' | 'tv' | 'person';
  children: React.ReactNode;
};

/** Groups results under a titled section with a colored type badge. */
function ResultSection({title, badge, children}: ResultSectionProps) {
  const badgeColors = {
    movie: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    tv: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    person: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badgeColors[badge]}`}
        >
          {badge === 'tv' ? 'TV' : title}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {children}
      </div>
    </section>
  );
}

// ============================================================
// Individual Result Cards
// ============================================================

type MovieResultCardProps = {movie: MovieResult};

/** Movie search result card linking to the movie detail page. */
function MovieResultCard({movie}: MovieResultCardProps) {
  const rating = movie.voteAverage !== null
    ? movie.voteAverage.toFixed(1)
    : null;
  const posterSrc = movie.posterPath
    ? `${TMDB_IMAGE_BASE}/w500${movie.posterPath}`
    : null;
  const year = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : null;

  // Use TMDB lookup route for TMDB-only results, DB ID for local results
  const href = movie.source === 'tmdb'
    ? `/movie/tmdb/${movie.id}`
    : `/movie/${movie.id}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-lg overflow-hidden bg-surface border border-border hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:scale-[1.03]"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        {posterSrc ? (
          <Image
            src={posterSrc}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-foreground/40">
            No Image
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2 bg-blue-500/80 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded">
          Movie
        </div>

        {/* TMDB badge */}
        {movie.source === 'tmdb' && (
          <div className="absolute top-2 right-2 bg-orange-500/80 backdrop-blur-sm text-[10px] font-bold text-white px-2 py-0.5 rounded">
            TMDB
          </div>
        )}

        {/* Rating badge */}
        {rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-xs font-semibold text-yellow-400 px-2 py-1 rounded-md">
            <svg
              className="w-3 h-3 fill-current"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{rating}</span>
          </div>
        )}
      </div>

      {/* Title + year */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-blue-400 transition-colors">
          {movie.title}
        </h3>
        {year && (
          <p className="text-xs text-foreground/40 mt-1">{year}</p>
        )}
      </div>
    </Link>
  );
}

type TvSeriesResultCardProps = {series: TvSeriesResult};

/** TV series search result card linking to the series detail page. */
function TvSeriesResultCard({series}: TvSeriesResultCardProps) {
  const rating = series.voteAverage !== null
    ? series.voteAverage.toFixed(1)
    : null;
  const posterSrc = series.posterPath
    ? `${TMDB_IMAGE_BASE}/w500${series.posterPath}`
    : null;
  const year = series.firstAirDate
    ? new Date(series.firstAirDate).getFullYear()
    : null;

  const href = series.source === 'tmdb'
    ? `/tv/tmdb/${series.id}`
    : `/tv/${series.id}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-lg overflow-hidden bg-surface border border-border hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:scale-[1.03]"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        {posterSrc ? (
          <Image
            src={posterSrc}
            alt={series.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-foreground/40">
            No Image
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2 bg-purple-500/80 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded">
          TV
        </div>

        {/* TMDB badge */}
        {series.source === 'tmdb' && (
          <div className="absolute top-2 right-2 bg-orange-500/80 backdrop-blur-sm text-[10px] font-bold text-white px-2 py-0.5 rounded">
            TMDB
          </div>
        )}

        {/* Rating badge */}
        {rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-xs font-semibold text-yellow-400 px-2 py-1 rounded-md">
            <svg
              className="w-3 h-3 fill-current"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{rating}</span>
          </div>
        )}
      </div>

      {/* Name + year */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-purple-400 transition-colors">
          {series.name}
        </h3>
        {year && (
          <p className="text-xs text-foreground/40 mt-1">{year}</p>
        )}
      </div>
    </Link>
  );
}

type PersonResultCardProps = {person: PersonResult};

/** Person search result card linking to the person detail page. */
function PersonResultCard({person}: PersonResultCardProps) {
  const profileSrc = person.profilePath
    ? `${TMDB_IMAGE_BASE}/w500${person.profilePath}`
    : null;

  const href = person.source === 'tmdb'
    ? `/person/tmdb/${person.tmdbId}`
    : `/person/${person.tmdbId}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-lg overflow-hidden bg-surface border border-border hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 hover:scale-[1.03]"
    >
      {/* Profile image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        {profileSrc ? (
          <Image
            src={profileSrc}
            alt={person.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-3xl font-bold text-foreground/20">
            {person.name.charAt(0)}
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2 bg-green-500/80 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded">
          Person
        </div>

        {/* TMDB badge */}
        {person.source === 'tmdb' && (
          <div className="absolute top-2 right-2 bg-orange-500/80 backdrop-blur-sm text-[10px] font-bold text-white px-2 py-0.5 rounded">
            TMDB
          </div>
        )}
      </div>

      {/* Name + department */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-green-400 transition-colors">
          {person.name}
        </h3>
        {person.knownForDepartment && (
          <p className="text-xs text-foreground/40 mt-1">
            {person.knownForDepartment}
          </p>
        )}
      </div>
    </Link>
  );
}

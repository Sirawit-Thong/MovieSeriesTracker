import TmdbImage from '@/components/ui/TmdbImage';
import {Link} from '@/i18n/navigation';
import {useLocale} from 'next-intl';
import {getDisplayName} from '@/lib/i18n/country-names';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

type MediaCardProps = {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  voteAverage: number | null;
  type: 'movie' | 'tv';
  releaseDate?: string | Date | null;
  countryCodes?: string[];
};

export default function MediaCard({
  tmdbId,
  title,
  posterPath,
  voteAverage,
  type,
  releaseDate,
  countryCodes,
}: MediaCardProps) {
  const locale = useLocale();
  const detailHref = type === 'movie' ? `/movie/${tmdbId}` : `/tv/${tmdbId}`;
  const posterSrc = posterPath
    ? `${TMDB_IMAGE_BASE}/w500${posterPath}`
    : null;
  const rating =
    voteAverage !== null ? voteAverage.toFixed(1) : null;
  const year = releaseDate
    ? new Date(releaseDate).getFullYear()
    : null;
  const primaryCountry = countryCodes?.[0];

  return (
    <Link
      href={detailHref}
      className="group relative flex flex-col rounded-lg overflow-hidden bg-surface border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:scale-[1.03]"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        {posterSrc ? (
<TmdbImage 
            src={posterSrc}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover"
            priority={false}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-foreground/40">
            No Image
          </div>
        )}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rating badge — top-right corner */}
        {rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-xs font-semibold text-yellow-400 px-2 py-1 rounded-md">
            <svg
              className="w-3 h-3 fill-current"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{rating}</span>
          </div>
        )}

        {/* Country badge — bottom-left */}
        {primaryCountry && (
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white/80 px-1.5 py-0.5 rounded">
            {getDisplayName(primaryCountry, primaryCountry, locale)}
          </div>
        )}
      </div>

      {/* Title + Year */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        {year && year > 0 && (
          <p className="text-xs text-foreground/40 mt-1">{year}</p>
        )}
      </div>
    </Link>
  );
}

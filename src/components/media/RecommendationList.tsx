import Image from 'next/image';
import {Link} from '@/i18n/navigation';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export type RecommendationItem = {
  id: number;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number | null;
  mediaType: 'movie' | 'tv';
  releaseDate?: string | Date | null;
};

type RecommendationListProps = {
  items: RecommendationItem[];
};

/**
 * Horizontal scrollable list of recommended/similar media items.
 * Each card shows poster, title, year, and rating badge.
 * Links to the appropriate detail page.
 */
export default function RecommendationList({items}: RecommendationListProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-3 min-w-max pb-2">
        {items.map((item) => {
          const detailHref =
            item.mediaType === 'movie' ? `/movie/tmdb/${item.tmdbId}` : `/tv/tmdb/${item.tmdbId}`;
          const posterSrc = item.posterPath
            ? `${TMDB_IMAGE_BASE}/w342${item.posterPath}`
            : null;
          const rating =
            item.voteAverage !== null ? item.voteAverage.toFixed(1) : null;
          const year = item.releaseDate
            ? new Date(item.releaseDate).getFullYear()
            : null;

          return (
            <Link
              key={`${item.mediaType}-${item.id}`}
              href={detailHref}
              className="group w-[130px] md:w-[150px] flex-shrink-0 bg-surface hover:bg-surface-hover rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:scale-[1.03]"
            >
              {/* Poster */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
                {posterSrc ? (
                  <Image
                    src={posterSrc}
                    alt={item.title}
                    fill
                    sizes="150px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-foreground/30">
                    —
                  </div>
                )}
                {/* Rating badge */}
                {rating && (
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-black/70 backdrop-blur-sm text-[10px] font-semibold text-yellow-400 px-1.5 py-0.5 rounded">
                    <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {rating}
                  </div>
                )}
              </div>
              {/* Title + Year */}
              <div className="p-2">
                <p className="text-xs font-medium text-foreground/90 group-hover:text-white line-clamp-2 transition-colors">
                  {item.title}
                </p>
                {year && year > 0 && (
                  <p className="text-[10px] text-foreground/40 mt-0.5">{year}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

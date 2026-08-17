import MediaCard from './MediaCard';

type MediaSectionProps = {
  title: string;
  items: Array<{
    id: number;
    tmdbId: number;
    title?: string;
    name?: string;
    posterPath: string | null;
    voteAverage: number | null;
    releaseDate?: string | Date | null;
    firstAirDate?: string | null;
  }>;
  type: 'movie' | 'tv';
  /** When true, renders a horizontal scroll container instead of a grid. */
  horizontal?: boolean;
  /** Map of tmdbId → localized title from translations. */
  localizedTitles?: Record<number, string>;
};

/**
 * Section wrapper that displays a title and a grid of MediaCards.
 * Supports both responsive grid and horizontal-scroll modes.
 */
export default function MediaSection({
  title,
  items,
  type,
  horizontal = false,
  localizedTitles = {},
}: MediaSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="w-full py-8">
      {/* Section header */}
      <div className="max-w-7xl mx-auto px-4 mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          {title}
          <span className="block mt-1 h-0.5 w-12 bg-primary rounded" />
        </h2>
      </div>

      {/* Content container */}
      {horizontal ? (
        /* Horizontal scroll on mobile and tablet */
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 px-4 pb-4 min-w-max max-w-7xl mx-auto">
            {items.map((item) => (
              <div key={item.id} className="w-[140px] md:w-[160px] flex-shrink-0">
                <MediaCard
                  tmdbId={item.tmdbId}
                  title={localizedTitles[item.tmdbId] || item.title || item.name || ''}
                  posterPath={item.posterPath}
                  voteAverage={item.voteAverage}
                  type={type}
                  releaseDate={item.releaseDate ?? item.firstAirDate}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Responsive grid */
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {items.map((item) => (
              <MediaCard
                key={item.id}
                tmdbId={item.tmdbId}
                title={localizedTitles[item.tmdbId] || item.title || item.name || ''}
                posterPath={item.posterPath}
                voteAverage={item.voteAverage}
                type={type}
                releaseDate={item.releaseDate ?? item.firstAirDate}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

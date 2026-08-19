'use client';

import {useState} from 'react';
import Link from 'next/link';
import TmdbImage from '@/components/ui/TmdbImage';

type WatchlistItemData = {
  id: number;
  entityType: string;
  entityId: number;
};

type MediaData = {
  id: number;
  title: string;
  posterPath: string | null;
  voteAverage: number | null;
  firstAirDate?: string | null;
  releaseDate?: string | null;
};

type Translations = {
  title: string;
  items: string;
  removeFromWatchlist: string;
  empty: string;
  emptyDescription: string;
  movies: string;
  tvSeries: string;
  person: string;
  backToWatchlists: string;
  noImage: string;
};

type Props = {
  locale: string;
  watchlist: {
    id: number;
    name: string;
    description: string | null;
    items: WatchlistItemData[];
  };
  initialMedia: Record<string, MediaData>;
  translations: Translations;
};

const TMDB_IMG = 'https://image.tmdb.org/t/p/w200';

export default function WatchlistDetailContent({locale, watchlist, initialMedia, translations: t}: Props) {
  const [items, setItems] = useState<WatchlistItemData[]>(watchlist.items);
  const [mediaCache] = useState<Record<string, MediaData>>(initialMedia);

  async function handleRemove(item: WatchlistItemData) {
    try {
      const params = new URLSearchParams({
        entityType: item.entityType,
        entityId: String(item.entityId),
      });
      const res = await fetch(`/api/watchlists/${watchlist.id}/items?${params}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      }
    } catch {
      // ignore
    }
  }

  const getMedia = (item: WatchlistItemData) => {
    const key = `${item.entityType}-${item.entityId}`;
    return mediaCache[key] ?? null;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/watchlists" className="text-sm text-primary hover:text-primary-hover transition-colors mb-4 inline-block">
          ← {t.backToWatchlists}
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">{watchlist.name}</h1>
        {watchlist.description && (
          <p className="text-foreground/50">{watchlist.description}</p>
        )}
        <p className="text-xs text-foreground/30 mt-2">
          {items.length} {t.items}
        </p>
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-foreground/70 mb-2">{t.empty}</p>
          <p className="text-sm text-foreground/40">{t.emptyDescription}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => {
            const media = getMedia(item);
            if (!media) return null;

            const link = item.entityType === 'MOVIE'
              ? `/${locale}/movie/${item.entityId}`
              : item.entityType === 'TV'
                ? `/${locale}/tv/${item.entityId}`
                : `/${locale}/person/${item.entityId}`;

            return (
              <div key={item.id} className="group relative">
                <Link href={link}>
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-surface mb-2">
                    {media.posterPath ? (
                      <TmdbImage
                        src={`${TMDB_IMG}${media.posterPath}`}
                        alt={media.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-foreground/30 text-sm">
                        {t.noImage}
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-white group-hover:text-primary transition-colors line-clamp-1">
                    {media.title}
                  </h3>
                  <p className="text-xs text-foreground/40">
                    {item.entityType === 'MOVIE' ? t.movies : item.entityType === 'TV' ? t.tvSeries : t.person}
                    {media.voteAverage ? ` · ★ ${media.voteAverage.toFixed(1)}` : ''}
                  </p>
                </Link>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemove(item)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white/70 hover:text-red-400
                    flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-xs"
                  title={t.removeFromWatchlist}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

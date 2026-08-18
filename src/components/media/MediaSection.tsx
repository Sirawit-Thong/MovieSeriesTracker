'use client';

import {useRef, useState, useEffect, useCallback} from 'react';
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
  horizontal?: boolean;
  localizedTitles?: Record<number, string>;
};

function HorizontalScroll({
  items,
  type,
  localizedTitles,
}: {
  items: MediaSectionProps['items'];
  type: 'movie' | 'tv';
  localizedTitles: Record<number, string>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, {passive: true});
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, items.length]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>(':scope > div')?.offsetWidth ?? 160;
    const scrollAmount = cardWidth * 3 + 12 * 3;
    el.scrollBy({left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth'});
  };

  return (
    <div className="relative group/scroll">
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center
            bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent
            opacity-0 group-hover/scroll:opacity-100 transition-opacity duration-200
            cursor-pointer"
          aria-label="Scroll left"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center
            bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent
            opacity-0 group-hover/scroll:opacity-100 transition-opacity duration-200
            cursor-pointer"
          aria-label="Scroll right"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 px-4
          [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0
          [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className="w-[140px] md:w-[160px] flex-shrink-0 snap-start"
          >
            <MediaCard
              tmdbId={item.tmdbId}
              title={localizedTitles[item.tmdbId] || item.title || item.name || ''}
              posterPath={item.posterPath}
              voteAverage={item.voteAverage}
              type={type}
              releaseDate={item.releaseDate ?? item.firstAirDate}
              priority={index < 4}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Section wrapper that displays a title and a grid of MediaCards.
 * On mobile: vertical 2-column grid (top-to-bottom scroll).
 * On desktop (md+): horizontal scroll if `horizontal` is true, otherwise grid.
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
    <section className="w-full py-6 md:py-8">
      {/* Section header */}
      <div className="max-w-7xl mx-auto px-4 mb-3 md:mb-4">
        <h2 className="text-lg md:text-2xl font-bold text-foreground">
          {title}
          <span className="block mt-1 h-0.5 w-10 md:w-12 bg-primary rounded" />
        </h2>
      </div>

      {/* Mobile: always vertical grid */}
      <div className="md:hidden px-4">
        <div className="grid grid-cols-2 gap-3">
          {items.map((item, index) => (
            <MediaCard
              key={item.id}
              tmdbId={item.tmdbId}
              title={localizedTitles[item.tmdbId] || item.title || item.name || ''}
              posterPath={item.posterPath}
              voteAverage={item.voteAverage}
              type={type}
              releaseDate={item.releaseDate ?? item.firstAirDate}
              priority={index < 2}
            />
          ))}
        </div>
      </div>

      {/* Desktop: horizontal scroll or grid */}
      <div className="hidden md:block">
        {horizontal ? (
          <div className="max-w-7xl mx-auto">
            <HorizontalScroll
              items={items}
              type={type}
              localizedTitles={localizedTitles}
            />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {items.map((item, index) => (
                <MediaCard
                  key={item.id}
                  tmdbId={item.tmdbId}
                  title={localizedTitles[item.tmdbId] || item.title || item.name || ''}
                  posterPath={item.posterPath}
                  voteAverage={item.voteAverage}
                  type={type}
                  releaseDate={item.releaseDate ?? item.firstAirDate}
                  priority={index < 6}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

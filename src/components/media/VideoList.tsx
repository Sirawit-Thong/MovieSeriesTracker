'use client';

import {useRef, useState, useEffect, useCallback} from 'react';
import TmdbImage from '@/components/ui/TmdbImage';

type VideoEntry = {
  id: number;
  key: string;
  name: string;
  site: string;
  type: string | null;
  language: string | null;
  official: boolean | null;
};

type VideoListProps = {
  videos: VideoEntry[];
};

/**
 * Horizontal scrollable list of YouTube video thumbnails.
 * Each card shows a thumbnail with play button overlay and video name.
 * Clicking opens the video on YouTube in a new tab.
 */
export default function VideoList({videos}: VideoListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const youtubeVideos = videos.filter((v) => v.site === 'YouTube');

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
  }, [checkScroll, youtubeVideos.length]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>(':scope > a')?.offsetWidth ?? 280;
    const scrollAmount = cardWidth * 3 + 16 * 3;
    el.scrollBy({left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth'});
  };

  if (videos.length === 0) return null;
  if (youtubeVideos.length === 0) return null;

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
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory -mx-4 px-4 pb-2 min-w-max
          [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0
          [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {youtubeVideos.map((video) => (
          <a
            key={video.id}
            href={`https://www.youtube.com/watch?v=${video.key}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex-shrink-0 w-[280px] md:w-[320px] snap-start"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all bg-muted">
              <TmdbImage
                src={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}
                alt={video.name}
                fill
                sizes="(max-width: 768px) 280px, 320px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <svg
                    className="w-5 h-5 text-white ml-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              {/* Video type badge */}
              {video.type && (
                <div className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold bg-black/70 backdrop-blur-sm text-white/80 rounded">
                  {video.type}
                </div>
              )}
            </div>
            <p className="text-sm text-foreground/80 group-hover:text-white mt-2 line-clamp-2 transition-colors">
              {video.name}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}

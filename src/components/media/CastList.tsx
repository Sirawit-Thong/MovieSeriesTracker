'use client';

import {useRef, useState, useEffect, useCallback} from 'react';
import TmdbImage from '@/components/ui/TmdbImage';
import {Link} from '@/i18n/navigation';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export type CastMember = {
  id: number;
  tmdbId: number;
  name: string;
  profilePath: string | null;
  character?: string;
  order?: number;
  creditId?: string | number;
};

type CastListProps = {
  items: CastMember[];
};

/**
 * Horizontal scrollable list of cast members.
 * Each card shows profile image, actor name, character name, and billing order.
 * Links to person detail page.
 */
export default function CastList({items}: CastListProps) {
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
    const cardWidth = el.querySelector<HTMLElement>(':scope > div')?.offsetWidth ?? 140;
    const scrollAmount = cardWidth * 3 + 12 * 3;
    el.scrollBy({left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth'});
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative group/scroll -mx-4">
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
        {items.map((member) => {
          const profileSrc = member.profilePath
            ? `${TMDB_IMAGE_BASE}/w185${member.profilePath}`
            : null;

          return (
            <Link
              key={member.creditId ?? `person-${member.id}-${member.order ?? 0}`}
              href={`/person/${member.tmdbId}`}
              className="group w-[120px] md:w-[140px] flex-shrink-0 snap-start bg-surface hover:bg-surface-hover rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:scale-[1.03]"
            >
              {/* Profile image */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
                {profileSrc ? (
                  <TmdbImage
                    src={profileSrc}
                    alt={member.name}
                    fill
                    sizes="140px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl text-foreground/20 font-bold">
                    {member.name.charAt(0)}
                  </div>
                )}

                {/* Order badge */}
                {member.order !== undefined && member.order !== null && (
                  <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm text-[10px] font-semibold text-foreground/60 w-5 h-5 rounded-full flex items-center justify-center">
                    {member.order + 1}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2">
                <p className="text-xs font-medium text-foreground/90 group-hover:text-white line-clamp-1 transition-colors">
                  {member.name}
                </p>
                {member.character && (
                  <p className="text-[11px] text-foreground/50 line-clamp-1 mt-0.5">
                    {member.character}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

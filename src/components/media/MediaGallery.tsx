'use client';

import {useState, useCallback, useEffect} from 'react';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

type ImageEntry = {
  id: number;
  filePath: string;
  aspectRatio: number | null;
  width: number | null;
  height: number | null;
  imageType: string | null;
  voteAverage: number | null;
  language: string | null;
};

type MediaGalleryProps = {
  images: ImageEntry[];
};

type FilterType = 'all' | 'backdrop' | 'poster';

/**
 * Image gallery with thumbnail grid and lightbox modal.
 * Supports filtering by image type (backdrop/poster).
 * Click an image to open a full-size modal preview.
 */
export default function MediaGallery({images}: MediaGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageEntry | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredImages = images.filter((img) => {
    if (filter === 'all') return true;
    if (filter === 'backdrop') return img.imageType === 'backdrop';
    if (filter === 'poster') return img.imageType === 'poster';
    return true;
  });

  const backdropCount = images.filter((i) => i.imageType === 'backdrop').length;
  const posterCount = images.filter((i) => i.imageType === 'poster').length;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    },
    []
  );

  useEffect(() => {
    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [selectedImage, handleKeyDown]);

  if (images.length === 0) return null;

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
            filter === 'all'
              ? 'bg-primary text-white border-primary'
              : 'bg-surface text-foreground/70 border-border hover:bg-surface-hover'
          }`}
        >
          All ({images.length})
        </button>
        {backdropCount > 0 && (
          <button
            onClick={() => setFilter('backdrop')}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              filter === 'backdrop'
                ? 'bg-primary text-white border-primary'
                : 'bg-surface text-foreground/70 border-border hover:bg-surface-hover'
            }`}
          >
            Backdrops ({backdropCount})
          </button>
        )}
        {posterCount > 0 && (
          <button
            onClick={() => setFilter('poster')}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              filter === 'poster'
                ? 'bg-primary text-white border-primary'
                : 'bg-surface text-foreground/70 border-border hover:bg-surface-hover'
            }`}
          >
            Posters ({posterCount})
          </button>
        )}
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filteredImages.map((img) => (
          <button
            key={img.id}
            onClick={() => setSelectedImage(img)}
            className="relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all group cursor-pointer bg-muted"
          >
            <img
              src={`${TMDB_IMAGE_BASE}/w500${img.filePath}`}
              alt={`Image ${img.id}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10 p-2"
            aria-label="Close"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          {/* Full-size image */}
          <img
            src={`${TMDB_IMAGE_BASE}/original${selectedImage.filePath}`}
            alt="Full size"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

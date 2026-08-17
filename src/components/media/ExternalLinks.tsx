'use client';

type ExternalIdEntry = {
  imdbId: string | null;
  facebookId: string | null;
  instagramId: string | null;
  twitterId: string | null;
  tiktokId: string | null;
  youtubeId: string | null;
  wikidataId: string | null;
  tvdbId: number | null;
};

type ExternalLinksProps = {
  externalIds: ExternalIdEntry | null;
  tmdbId?: number;
  mediaType: 'movie' | 'tv' | 'person';
  homepage?: string | null;
};

type SocialLink = {
  label: string;
  url: string;
  color: string;
  icon: React.ReactNode;
};

/**
 * Displays external links for a media item or person:
 * IMDb, TMDB, homepage, and social media (Facebook, Instagram, Twitter, TikTok, YouTube).
 */
export default function ExternalLinks({
  externalIds,
  tmdbId,
  mediaType,
  homepage,
}: ExternalLinksProps) {
  const links: SocialLink[] = [];

  // IMDb
  if (externalIds?.imdbId) {
    const path =
      mediaType === 'person'
        ? `/name/${externalIds.imdbId}`
        : `/title/${externalIds.imdbId}`;
    links.push({
      label: 'IMDb',
      url: `https://www.imdb.com${path}`,
      color: 'text-yellow-400 hover:text-yellow-300',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
    });
  }

  // TMDB
  if (tmdbId) {
    const tmdbPath = mediaType === 'person' ? 'person' : mediaType;
    links.push({
      label: 'TMDB',
      url: `https://www.themoviedb.org/${tmdbPath}/${tmdbId}`,
      color: 'text-primary hover:text-primary-hover',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      ),
    });
  }

  // Facebook
  if (externalIds?.facebookId) {
    links.push({
      label: 'Facebook',
      url: `https://www.facebook.com/${externalIds.facebookId}`,
      color: 'text-blue-400 hover:text-blue-300',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    });
  }

  // Instagram
  if (externalIds?.instagramId) {
    links.push({
      label: 'Instagram',
      url: `https://www.instagram.com/${externalIds.instagramId}`,
      color: 'text-pink-400 hover:text-pink-300',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    });
  }

  // Twitter/X
  if (externalIds?.twitterId) {
    links.push({
      label: 'Twitter',
      url: `https://twitter.com/${externalIds.twitterId}`,
      color: 'text-sky-400 hover:text-sky-300',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    });
  }

  // TikTok
  if (externalIds?.tiktokId) {
    links.push({
      label: 'TikTok',
      url: `https://www.tiktok.com/@${externalIds.tiktokId}`,
      color: 'text-foreground/80 hover:text-white',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48v-7.06a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-.19-.69z" />
        </svg>
      ),
    });
  }

  // YouTube
  if (externalIds?.youtubeId) {
    links.push({
      label: 'YouTube',
      url: `https://www.youtube.com/channel/${externalIds.youtubeId}`,
      color: 'text-red-500 hover:text-red-400',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    });
  }

  // Wikidata
  if (externalIds?.wikidataId) {
    links.push({
      label: 'Wikidata',
      url: `https://www.wikidata.org/wiki/${externalIds.wikidataId}`,
      color: 'text-foreground/60 hover:text-foreground/80',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12.09 1.17C6.15 1.17 1.26 5.69 1.26 11.33c0 3.37 1.79 6.35 4.54 8.12l.04-.02-1.83 3.4H7.9l2.68-4.73.15.01c.32.02.65.02.98.02 5.94 0 10.83-4.52 10.83-10.16C22.54 5.69 17.65 1.17 12.09 1.17zm-1.4 15.26c-.29 0-.58-.02-.86-.07l-.13-.02-2.21 3.9 1.79-3.22-.48-.26c-1.89-1.06-3.06-3-3.06-5.2 0-3.39 2.94-6.14 6.56-6.14.18 0 .36.01.54.03v.02c-2.33.51-4.15 2.76-4.15 5.47 0 1.52.64 2.89 1.65 3.87l-.28.33-.44.01z" />
        </svg>
      ),
    });
  }

  // Homepage (external)
  if (homepage) {
    links.push({
      label: 'Homepage',
      url: homepage,
      color: 'text-primary hover:text-primary-hover',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    });
  }

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 px-3 py-1.5 text-sm bg-surface hover:bg-surface-hover border border-border rounded-full transition-colors ${link.color}`}
        >
          {link.icon}
          {link.label}
        </a>
      ))}
    </div>
  );
}

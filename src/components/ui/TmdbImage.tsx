import Image, {type ImageProps} from 'next/image';

/**
 * Wrapper around next/image for TMDB CDN images.
 * Uses `unoptimized` to bypass server-side image optimization,
 * which fails when the server cannot resolve image.tmdb.org (e.g. DNS issues).
 * The browser fetches the image directly from TMDB's CDN.
 */
export default function TmdbImage({alt, ...props}: ImageProps) {
  return (
    <Image
      alt={alt}
      unoptimized
      {...props}
    />
  );
}

import {prisma} from '@/lib/db';
import {getLocalizedField} from '@/lib/ingestion/translation-sync';

type MediaItem = {
  tmdbId: number;
  type: 'movie' | 'tv';
};

/**
 * Batch-resolve localized titles for a list of media items.
 * Returns a map of tmdbId → localized title.
 * Falls back to the base English title if no translation exists.
 */
export async function resolveLocalizedTitles(
  locale: string,
  items: MediaItem[],
): Promise<Record<number, string>> {
  if (items.length === 0) return {};

  const movieTmdbIds = items.filter((i) => i.type === 'movie').map((i) => i.tmdbId);
  const tvTmdbIds = items.filter((i) => i.type === 'tv').map((i) => i.tmdbId);

  // Batch fetch movie/TV records from DB
  const [movies, tvSeries] = await Promise.all([
    movieTmdbIds.length > 0
      ? prisma.movie.findMany({
          where: {tmdbId: {in: movieTmdbIds}},
          select: {id: true, tmdbId: true, title: true},
        })
      : [],
    tvTmdbIds.length > 0
      ? prisma.tvSeries.findMany({
          where: {tmdbId: {in: tvTmdbIds}},
          select: {id: true, tmdbId: true, name: true},
        })
      : [],
  ]);

  // Batch fetch translations for all found records
  const movieDbIds = movies.map((m) => m.id);
  const tvDbIds = tvSeries.map((t) => t.id);

  const [movieTranslations, tvTranslations] = await Promise.all([
    movieDbIds.length > 0
      ? prisma.translation.findMany({
          where: {entityType: 'movie', entityId: {in: movieDbIds}},
        })
      : [],
    tvDbIds.length > 0
      ? prisma.translation.findMany({
          where: {entityType: 'tv', entityId: {in: tvDbIds}},
        })
      : [],
  ]);

  // Group translations by entityId
  const movieTransByEntity = new Map<number, typeof movieTranslations>();
  for (const t of movieTranslations) {
    const existing = movieTransByEntity.get(t.entityId) || [];
    existing.push(t);
    movieTransByEntity.set(t.entityId, existing);
  }
  const tvTransByEntity = new Map<number, typeof tvTranslations>();
  for (const t of tvTranslations) {
    const existing = tvTransByEntity.get(t.entityId) || [];
    existing.push(t);
    tvTransByEntity.set(t.entityId, existing);
  }

  // Resolve localized titles
  const titles: Record<number, string> = {};

  for (const movie of movies) {
    const trans = movieTransByEntity.get(movie.id) || [];
    titles[movie.tmdbId] =
      getLocalizedField(trans, locale, 'name', movie.title) ?? movie.title;
  }

  for (const tv of tvSeries) {
    const trans = tvTransByEntity.get(tv.id) || [];
    titles[tv.tmdbId] =
      getLocalizedField(trans, locale, 'name', tv.name) ?? tv.name;
  }

  return titles;
}

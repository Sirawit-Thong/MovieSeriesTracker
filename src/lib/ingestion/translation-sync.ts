// Translation Sync Service
// Fetches and stores Thai/English translations for movies, TV series, and persons.
// Uses the existing Translation table with polymorphic entityType/entityId.
//
// Strategy:
//   - Store Thai (th) and English (en) translations only
//   - The `data` JSON field contains localized title/name, overview, tagline/biography
//   - Detail pages resolve display fields based on locale from this table

import { PrismaClient } from '../../generated/prisma';
import type { TmdbClient } from '../tmdb/client';
import type { TmdbTranslationsResponse } from '../tmdb/types';

const LOG_PREFIX = '[translation-sync]';

// ============================================================
// Supported locales (focus on Thai + English)
// ============================================================

const SUPPORTED_LOCALES = ['th', 'en'];
const LOCALE_MAP: Record<string, { iso6391: string; iso31661: string }> = {
  th: { iso6391: 'th', iso31661: 'TH' },
  en: { iso6391: 'en', iso31661: 'US' },
};

// ============================================================
// Core: Store translations for an entity
// ============================================================

/**
 * Store Thai and English translations for a given entity.
 * Fetches from TMDB's translations endpoint and upserts into the Translation table.
 *
 * @param entityType - 'movie' | 'tv_series' | 'person'
 * @param entityId - Internal database ID
 * @param tmdbId - TMDB ID for fetching translations
 * @param client - TmdbClient instance
 * @param tx - Optional Prisma transaction client
 */
export async function storeTranslations(
  entityType: 'movie' | 'tv' | 'person',
  entityId: number,
  tmdbId: number,
  client: TmdbClient,
  tx?: PrismaClient
): Promise<void> {
  try {
    // Fetch translations from TMDB
    const response = await fetchTranslations(entityType, tmdbId, client);
    if (!response) return;

    // Filter to supported locales only
    const supportedTranslations = response.translations.filter(
      (tr) => SUPPORTED_LOCALES.includes(tr.iso_639_1)
    );

    if (supportedTranslations.length === 0) {
      console.log(`${LOG_PREFIX} No supported translations found for ${entityType} ${tmdbId}`);
      return;
    }

    // Upsert each translation
    const db = tx || (await import('../db')).default;
    for (const tr of supportedTranslations) {
      const dataJson = JSON.stringify(tr.data);
      const localeInfo = LOCALE_MAP[tr.iso_6391] || {
        iso6391: tr.iso_639_1,
        iso31661: tr.iso_3166_1,
      };

      await db.translation.upsert({
        where: {
          entityType_entityId_iso6391_iso31661: {
            entityType,
            entityId,
            iso6391: localeInfo.iso6391,
            iso31661: localeInfo.iso31661,
          },
        },
        create: {
          entityType,
          entityId,
          iso6391: localeInfo.iso6391,
          iso31661: localeInfo.iso31661,
          name: tr.name,
          englishName: tr.english_name,
          data: dataJson,
        },
        update: {
          name: tr.name,
          englishName: tr.english_name,
          data: dataJson,
        },
      });
    }

    console.log(
      `${LOG_PREFIX} Stored ${supportedTranslations.length} translations for ${entityType} ${entityId} (TMDB: ${tmdbId})`
    );
  } catch (error) {
    // Non-fatal: log but don't throw — translations are optional
    console.error(
      `${LOG_PREFIX} Failed to store translations for ${entityType} ${tmdbId}:`,
      error instanceof Error ? error.message : String(error)
    );
  }
}

// ============================================================
// Helpers: Fetch translations from TMDB
// ============================================================

async function fetchTranslations(
  entityType: 'movie' | 'tv' | 'person',
  tmdbId: number,
  client: TmdbClient
): Promise<TmdbTranslationsResponse | null> {
  try {
    switch (entityType) {
      case 'movie':
        return await client.getMovieTranslations(tmdbId);
      case 'tv':
        return await client.getTvTranslations(tmdbId);
      case 'person':
        return await client.getPersonTranslations(tmdbId);
      default:
        return null;
    }
  } catch (error) {
    console.error(
      `${LOG_PREFIX} Failed to fetch translations for ${entityType} ${tmdbId}:`,
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

// ============================================================
// Helper: Parse translation data from JSON string
// ============================================================

export interface TranslationData {
  title?: string;
  name?: string;
  overview?: string;
  tagline?: string;
  biography?: string;
}

/**
 * Parse the `data` JSON string from a Translation record.
 * Returns null if data is empty or invalid.
 */
export function parseTranslationData(data: string | null): TranslationData | null {
  if (!data) return null;
  try {
    return JSON.parse(data) as TranslationData;
  } catch {
    return null;
  }
}

// ============================================================
// Helper: Resolve localized field from translations
// ============================================================

/**
 * Get a localized field value from an entity's translations.
 *
 * @param translations - Array of Translation records for the entity
 * @param locale - User's locale (e.g., 'th', 'en')
 * @param field - The field to resolve ('title', 'name', 'overview', 'tagline', 'biography')
 * @param fallback - Fallback value if no translation found
 */
export function getLocalizedField(
  translations: Array<{ iso6391: string; data: string | null }>,
  locale: string,
  field: keyof TranslationData,
  fallback: string | null = null
): string | null {
  // Try to find translation for the exact locale
  const translation = translations.find((tr) => tr.iso6391 === locale);
  if (translation) {
    const data = parseTranslationData(translation.data);
    if (data && data[field]) {
      return data[field]!;
    }
  }

  // Fallback to English if locale is not English
  if (locale !== 'en') {
    const enTranslation = translations.find((tr) => tr.iso6391 === 'en');
    if (enTranslation) {
      const data = parseTranslationData(enTranslation.data);
      if (data && data[field]) {
        return data[field]!;
      }
    }
  }

  return fallback;
}

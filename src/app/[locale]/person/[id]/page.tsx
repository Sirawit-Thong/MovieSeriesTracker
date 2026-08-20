import {cache} from 'react';
import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {prisma} from '@/lib/db';
import PersonDetail from '@/components/person/PersonDetail';
import {getLocalizedField} from '@/lib/ingestion/translation-sync';
import {syncPersonCredits, syncCombinedCredits} from '@/lib/ingestion/credit-sync';
import {fetchAndUpsertPerson} from '@/lib/ingestion/person-sync';
import {TmdbClient} from '@/lib/tmdb/client';

type PersonPageProps = {
  params: Promise<{locale: string; id: string}>;
};

/**
 * Fetch a person by their TMDB ID with all related cast and crew credits.
 * Always re-syncs credits from TMDB to ensure completeness —
 * partial credits from media-credit-sync (when only one movie/TV was visited)
 * would otherwise be treated as "already synced".
 */
const getPersonById = cache(async function getPersonById(id: number, locale: string) {
  const person = await prisma.person.findUnique({
    where: {tmdbId: id},
    select: {
      id: true,
      tmdbId: true,
      biography: true,
      birthday: true,
      placeOfBirth: true,
      lastFetchedAt: true,
      _count: {select: {combinedCredits: true}},
    },
  });

  if (!person) return null;

  const personTranslations = await prisma.translation.findMany({
    where: {entityType: 'person', entityId: person.id},
    take: 1,
  });
  const isStub = !person.biography && !person.birthday && !person.placeOfBirth && personTranslations.length === 0;

  const CREDITS_STALE_MS = 7 * 24 * 60 * 60 * 1000;
  const creditsStale =
    !person.lastFetchedAt ||
    Date.now() - person.lastFetchedAt.getTime() > CREDITS_STALE_MS;

  const hasCombinedCredits = person._count.combinedCredits > 0;

  if (isStub) {
    console.log(`[person-page] Upgrading stub person ${id} to full record`);
    await fetchAndUpsertPerson(person.tmdbId);
  }

  // Re-sync credits from TMDB when: person is a stub, credits are stale,
  // or combinedCredits are missing (e.g. after fetchAndUpsertPerson set lastFetchedAt
  // but credits were never synced). Pass user locale so titles come back in the correct language.
  if (isStub || creditsStale || !hasCombinedCredits) {
    const tmdbLanguage = locale === 'th' ? 'th-TH' : 'en-US';
    const client = new TmdbClient({language: tmdbLanguage});
    const clientEn = new TmdbClient({language: 'en-US'});
    const [personDetails2, personDetailsEn] = await Promise.all([
      client.getPersonDetails(person.tmdbId, 'combined_credits'),
      tmdbLanguage !== 'en-US'
        ? clientEn.getPersonDetails(person.tmdbId, 'combined_credits').catch(() => null)
        : Promise.resolve(null),
      syncPersonCredits(person.tmdbId, client),
    ]);
    if (personDetails2.combined_credits) {
      await syncCombinedCredits(
        person.id,
        personDetails2.combined_credits,
        personDetailsEn?.combined_credits ?? undefined,
      );
    }
  }

  // Now fetch the full person with all relations
  const fullPerson = await prisma.person.findUnique({
    where: {tmdbId: id},
    include: {
      castCredits: {
        include: {
          movie: true,
          tvSeries: true,
        },
        orderBy: {order: 'asc'},
      },
      crewCredits: {
        include: {
          movie: true,
          tvSeries: true,
        },
      },
      combinedCredits: true,
    },
  });

  if (!fullPerson) return null;

  // Polymorphic sub-resources
  const [externalIds, images, translations] = await Promise.all([
    prisma.externalId.findFirst({
      where: {entityType: 'person', entityId: fullPerson.id},
    }),
    prisma.mediaImage.findMany({
      where: {entityType: 'person', entityId: fullPerson.id},
      orderBy: {voteAverage: 'desc'},
    }),
    prisma.translation.findMany({
      where: {entityType: 'person', entityId: fullPerson.id},
    }),
  ]);

  // Resolve localized titles for combined credits from our translations table
  const localizedTitles: Record<number, string> = {};
  if (fullPerson.combinedCredits.length > 0) {
    const uniqueMediaIds = [...new Set(fullPerson.combinedCredits.map(c => c.mediaId))];
    
    // Batch fetch all movie/TV records and their translations
    const [movies, tvSeries] = await Promise.all([
      prisma.movie.findMany({
        where: { tmdbId: { in: uniqueMediaIds } },
        select: { id: true, tmdbId: true, title: true },
      }),
      prisma.tvSeries.findMany({
        where: { tmdbId: { in: uniqueMediaIds } },
        select: { id: true, tmdbId: true, name: true },
      }),
    ]);

    // Build lookup maps
    const movieMap = new Map(movies.map(m => [m.tmdbId, m]));
    const tvMap = new Map(tvSeries.map(t => [t.tmdbId, t]));

    // Fetch translations for all found media
    const movieIds = movies.map(m => m.id);
    const tvIds = tvSeries.map(t => t.id);
    
    const [movieTranslations, tvTranslations] = await Promise.all([
      movieIds.length > 0 ? prisma.translation.findMany({
        where: { entityType: 'movie', entityId: { in: movieIds } },
      }) : [],
      tvIds.length > 0 ? prisma.translation.findMany({
        where: { entityType: 'tv', entityId: { in: tvIds } },
      }) : [],
    ]);

    // Group translations by entityId
    const movieTranslationsByEntity = new Map<number, typeof movieTranslations>();
    for (const t of movieTranslations) {
      const existing = movieTranslationsByEntity.get(t.entityId) || [];
      existing.push(t);
      movieTranslationsByEntity.set(t.entityId, existing);
    }
    const tvTranslationsByEntity = new Map<number, typeof tvTranslations>();
    for (const t of tvTranslations) {
      const existing = tvTranslationsByEntity.get(t.entityId) || [];
      existing.push(t);
      tvTranslationsByEntity.set(t.entityId, existing);
    }

    // Resolve localized titles
    for (const tmdbId of uniqueMediaIds) {
      const movie = movieMap.get(tmdbId);
      if (movie) {
        const trans = movieTranslationsByEntity.get(movie.id) || [];
        localizedTitles[tmdbId] = getLocalizedField(trans, locale, 'name', movie.title) ?? movie.title;
        continue;
      }
      const tv = tvMap.get(tmdbId);
      if (tv) {
        const trans = tvTranslationsByEntity.get(tv.id) || [];
        localizedTitles[tmdbId] = getLocalizedField(trans, locale, 'name', tv.name) ?? tv.name;
      }
    }
  }

  return {
    ...fullPerson,
    externalIds,
    images,
    translations,
    localizedTitles,
    localized: {
      name: getLocalizedField(translations, locale, 'name', fullPerson.name),
      biography: getLocalizedField(translations, locale, 'biography', fullPerson.biography),
    },
  };
});

export async function generateMetadata({
  params,
}: PersonPageProps): Promise<Metadata> {
  const {locale, id} = await params;
  const personId = Number(id);
  if (!Number.isInteger(personId)) {
    notFound();
  }
  const person = await getPersonById(personId, locale);

  if (!person) {
    return {title: 'Person Not Found'};
  }

  const name = person.localized?.name ?? person.name;
  const biography = person.localized?.biography ?? person.biography;

  return {
    title: `${name} | Movie Series Tracker`,
    description: biography?.slice(0, 160) ?? name,
    openGraph: {
      title: name,
      description: biography ?? undefined,
      images: person.profilePath
        ? [`https://image.tmdb.org/t/p/w780${person.profilePath}`]
        : undefined,
    },
  };
}

export default async function PersonPage({params}: PersonPageProps) {
  const {locale, id} = await params;
  setRequestLocale(locale);

  const personId = Number(id);
  if (!Number.isInteger(personId)) {
    notFound();
  }

  const person = await getPersonById(personId, locale);

  if (!person) {
    notFound();
  }

  return <PersonDetail person={person} locale={locale} />;
}

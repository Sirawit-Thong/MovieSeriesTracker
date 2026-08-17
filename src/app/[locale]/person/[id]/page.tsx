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
async function getPersonById(id: number, locale: string) {
  // First, fetch the person
  const person = await prisma.person.findUnique({
    where: {tmdbId: id},
    select: {id: true, tmdbId: true},
  });

  if (!person) return null;

  // Check if this is a stub person (created by movie/TV credit sync) — upgrade to full record
  const personDetails = await prisma.person.findUnique({
    where: {tmdbId: id},
    select: {biography: true, birthday: true, placeOfBirth: true},
  });
  const personTranslations = await prisma.translation.findMany({
    where: {entityType: 'person', entityId: person.id},
    take: 1,
  });
  const isStub = !personDetails?.biography && !personDetails?.birthday && !personDetails?.placeOfBirth && personTranslations.length === 0;

  if (isStub) {
    console.log(`[person-page] Upgrading stub person ${id} to full record`);
    await fetchAndUpsertPerson(person.tmdbId);
  }

  // Always re-sync credits from TMDB to ensure completeness.
  // syncPersonCredits fetches all movie + TV credits and replaces existing ones.
  // syncCombinedCredits fetches combined credits for the "Known For" and "Filmography" sections.
  // These handle the case where media-credit-sync only created partial credits
  // (e.g., only for one movie/TV the user visited earlier).
  const client = new TmdbClient();
  const [personDetails2] = await Promise.all([
    client.getPersonDetails(person.tmdbId, 'combined_credits'),
    syncPersonCredits(person.tmdbId, client),
  ]);
  // Also sync combined credits (used by Filmography — doesn't require FK to movie/TV)
  if (personDetails2.combined_credits) {
    await syncCombinedCredits(person.id, personDetails2.combined_credits);
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

  return {
    ...fullPerson,
    externalIds,
    images,
    translations,
    localized: {
      name: getLocalizedField(translations, locale, 'name', fullPerson.name),
      biography: getLocalizedField(translations, locale, 'biography', fullPerson.biography),
    },
  };
}

export async function generateMetadata({
  params,
}: PersonPageProps): Promise<Metadata> {
  const {locale, id} = await params;
  const person = await getPersonById(Number(id), locale);

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

  const person = await getPersonById(Number(id), locale);

  if (!person) {
    notFound();
  }

  return <PersonDetail person={person} locale={locale} />;
}

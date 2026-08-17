import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {prisma} from '@/lib/db';
import PersonDetail from '@/components/person/PersonDetail';
import {getLocalizedField} from '@/lib/ingestion/translation-sync';
import {ensurePersonCredits} from '@/lib/ingestion/credit-sync';

type PersonPageProps = {
  params: Promise<{locale: string; id: string}>;
};

/**
 * Fetch a person by their TMDB ID with all related cast and crew credits.
 * If no credits exist in the DB, syncs them from TMDB on demand.
 */
async function getPersonById(id: number, locale: string) {
  // First, fetch the person without credits
  const person = await prisma.person.findUnique({
    where: {tmdbId: id},
    select: {
      id: true,
      tmdbId: true,
      castCredits: {select: {id: true}, take: 1},
      crewCredits: {select: {id: true}, take: 1},
      combinedCredits: {select: {id: true}, take: 1},
    },
  });

  if (!person) return null;

  // Check if any credits exist
  const hasCredits =
    person.castCredits.length > 0 ||
    person.crewCredits.length > 0 ||
    person.combinedCredits.length > 0;

  // If no credits, sync from TMDB on demand
  if (!hasCredits) {
    await ensurePersonCredits(person.id, person.tmdbId);
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

import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {prisma} from '@/lib/db';
import PersonDetail from '@/components/person/PersonDetail';

type PersonPageProps = {
  params: Promise<{locale: string; id: string}>;
};

/**
 * Fetch a person by their TMDB ID with all related cast and crew credits.
 * Includes polymorphic sub-resources (external IDs, images, combined credits).
 * Returns null if no person is found.
 */
async function getPersonByTmdbId(tmdbId: number) {
  const person = await prisma.person.findUnique({
    where: {tmdbId},
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

  if (!person) return null;

  // Polymorphic sub-resources
  const [externalIds, images] = await Promise.all([
    prisma.externalId.findFirst({
      where: {entityType: 'person', entityId: person.id},
    }),
    prisma.mediaImage.findMany({
      where: {entityType: 'person', entityId: person.id},
      orderBy: {voteAverage: 'desc'},
    }),
  ]);

  return {
    ...person,
    externalIds,
    images,
  };
}

export async function generateMetadata({
  params,
}: PersonPageProps): Promise<Metadata> {
  const {id} = await params;
  const person = await getPersonByTmdbId(Number(id));

  if (!person) {
    return {title: 'Person Not Found'};
  }

  return {
    title: `${person.name} | Movie Series Tracker`,
    description: person.biography?.slice(0, 160) ?? person.name,
    openGraph: {
      title: person.name,
      description: person.biography ?? undefined,
      images: person.profilePath
        ? [`https://image.tmdb.org/t/p/w780${person.profilePath}`]
        : undefined,
    },
  };
}

export default async function PersonPage({params}: PersonPageProps) {
  const {locale, id} = await params;
  setRequestLocale(locale);

  const person = await getPersonByTmdbId(Number(id));

  if (!person) {
    notFound();
  }

  return <PersonDetail person={person} locale={locale} />;
}

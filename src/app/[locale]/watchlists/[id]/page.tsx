import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {auth} from '@/lib/auth/config';
import {prisma} from '@/lib/db';
import {notFound} from 'next/navigation';
import WatchlistDetailContent from '@/components/watchlist/WatchlistDetailContent';

export const dynamic = 'force-dynamic';

export default async function WatchlistDetailPage({
  params,
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale, id} = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-foreground/50">Please sign in.</p>
      </div>
    );
  }

  const watchlistId = Number(id);
  if (!Number.isInteger(watchlistId) || watchlistId <= 0) {
    notFound();
  }

  const watchlist = await prisma.watchlist.findUnique({
    where: {id: watchlistId},
    include: {items: true},
  });

  if (!watchlist || watchlist.userId !== session.user.id) {
    notFound();
  }

  const movieItems = watchlist.items.filter((i) => i.entityType === 'MOVIE');
  const tvItems = watchlist.items.filter((i) => i.entityType === 'TV');
  const personItems = watchlist.items.filter((i) => i.entityType === 'PERSON');

  const [movies, tvSeries, persons] = await Promise.all([
    movieItems.length > 0
      ? prisma.movie.findMany({
          where: {tmdbId: {in: movieItems.map((i) => i.entityId)}},
          select: {tmdbId: true, title: true, posterPath: true, voteAverage: true, releaseDate: true},
        })
      : [],
    tvItems.length > 0
      ? prisma.tvSeries.findMany({
          where: {tmdbId: {in: tvItems.map((i) => i.entityId)}},
          select: {tmdbId: true, name: true, posterPath: true, voteAverage: true, firstAirDate: true},
        })
      : [],
    personItems.length > 0
      ? prisma.person.findMany({
          where: {tmdbId: {in: personItems.map((i) => i.entityId)}},
          select: {tmdbId: true, name: true, profilePath: true},
        })
      : [],
  ]);

  const initialMedia: Record<string, {
    id: number;
    title: string;
    posterPath: string | null;
    voteAverage: number | null;
    firstAirDate?: string | null;
    releaseDate?: string | null;
  }> = {};
  for (const m of movies) {
    initialMedia[`MOVIE-${m.tmdbId}`] = {
      id: m.tmdbId, title: m.title, posterPath: m.posterPath,
      voteAverage: m.voteAverage, releaseDate: m.releaseDate?.toISOString() ?? null,
    };
  }
  for (const t of tvSeries) {
    initialMedia[`TV-${t.tmdbId}`] = {
      id: t.tmdbId, title: t.name, posterPath: t.posterPath,
      voteAverage: t.voteAverage, firstAirDate: t.firstAirDate,
    };
  }
  for (const p of persons) {
    initialMedia[`PERSON-${p.tmdbId}`] = {
      id: p.tmdbId, title: p.name, posterPath: p.profilePath,
      voteAverage: null,
    };
  }

  const t = await getTranslations({locale, namespace: 'Watchlist'});

  return (
    <WatchlistDetailContent
      locale={locale}
      watchlist={{
        id: watchlist.id,
        name: watchlist.name,
        description: watchlist.description,
        items: watchlist.items.map((item) => ({
          id: item.id,
          entityType: item.entityType,
          entityId: item.entityId,
        })),
      }}
      initialMedia={initialMedia}
      translations={{
        title: watchlist.name,
        items: t('items'),
        removeFromWatchlist: t('removeFromWatchlist'),
        empty: t('empty'),
        emptyDescription: t('emptyDescription'),
        movies: 'Movies',
        tvSeries: 'TV Series',
      }}
    />
  );
}

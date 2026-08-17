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

  const t = await getTranslations({locale, namespace: 'Watchlist'});
  const tAnnotation = await getTranslations({locale, namespace: 'annotation'});

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

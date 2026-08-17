import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import WatchlistContent from '@/components/watchlist/WatchlistContent';

export const dynamic = 'force-dynamic';

export default async function WatchlistsPage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations({locale, namespace: 'Watchlist'});

  return (
    <WatchlistContent
      locale={locale}
      translations={{
        title: t('title'),
        subtitle: t('subtitle'),
        create: t('create'),
        edit: t('edit'),
        delete: t('delete'),
        name: t('name'),
        description: t('description'),
        items: t('items'),
        empty: t('empty'),
        emptyDescription: t('emptyDescription'),
        confirmDelete: t('confirmDelete'),
        confirmDeleteDescription: t('confirmDeleteDescription'),
        cancel: t('cancel'),
        save: t('save'),
        addToWatchlist: t('addToWatchlist'),
        removeFromWatchlist: t('removeFromWatchlist'),
      }}
    />
  );
}

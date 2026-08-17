import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import LibraryContent from '@/components/library/LibraryContent';

export const dynamic = 'force-dynamic';

export default async function LibraryPage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations({locale, namespace: 'Library'});
  const tAnnotation = await getTranslations({locale, namespace: 'annotation'});

  return (
    <LibraryContent
      locale={locale}
      translations={{
        title: t('title'),
        subtitle: t('subtitle'),
        all: t('all'),
        movies: t('movies'),
        tvSeries: t('tvSeries'),
        watched: tAnnotation('watched'),
        watching: tAnnotation('watching'),
        wantToWatch: tAnnotation('wantToWatch'),
        dropped: tAnnotation('dropped'),
        searchPlaceholder: t('searchPlaceholder'),
        empty: t('empty'),
        emptyDescription: t('emptyDescription'),
        noResults: t('noResults'),
        sortBy: t('sortBy'),
        sortUpdated: t('sortUpdated'),
        sortRating: t('sortRating'),
        sortTitle: t('sortTitle'),
        episodeProgress: t('episodeProgress'),
      }}
    />
  );
}

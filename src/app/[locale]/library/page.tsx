import {setRequestLocale} from 'next-intl/server';
import LibraryContent from '@/components/library/LibraryContent';

export const dynamic = 'force-dynamic';

export default async function LibraryPage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <LibraryContent locale={locale} />;
}

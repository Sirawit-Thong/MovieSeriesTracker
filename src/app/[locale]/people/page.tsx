import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {getPeopleList} from '@/lib/db/media-queries';
import {Link} from '@/i18n/navigation';

export const dynamic = 'force-dynamic';

const TMDB_IMG = 'https://image.tmdb.org/t/p/w200';

export default async function PeoplePage({
  params,
  searchParams,
}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<{page?: string}>;
}) {
  const {locale} = await params;
  const {page} = await searchParams;
  setRequestLocale(locale);

  const tNav = await getTranslations({locale, namespace: 'Navigation'});

  const pageSize = 24;
  const currentPage = Math.max(1, Number(page) || 1);
  const offset = (currentPage - 1) * pageSize;

  const {items, total} = await getPeopleList(pageSize, offset);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">{tNav('people')}</h1>
      <p className="text-foreground/50 mb-8">
        {total} {tNav('people').toLowerCase()}
      </p>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-foreground/70">No people in database yet.</p>
          <p className="text-sm text-foreground/40 mt-2">Run a sync from the admin panel to populate data.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {items.map((person) => (
              <Link
                key={person.id}
                href={`/${locale}/person/${person.id}`}
                className="group relative flex flex-col rounded-lg overflow-hidden bg-surface border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:scale-[1.03]"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden">
                  {person.profilePath ? (
                    <img
                      src={`${TMDB_IMG}${person.profilePath}`}
                      alt={person.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-foreground/40">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {person.name}
                  </h3>
                  {person.knownForDepartment && (
                    <p className="text-xs text-foreground/40 mt-0.5">
                      {person.knownForDepartment}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {currentPage > 1 && (
                <a
                  href={`/${locale}/people?page=${currentPage - 1}`}
                  className="px-4 py-2 bg-surface border border-border rounded-lg text-sm text-foreground/70 hover:text-white hover:bg-surface-hover transition-colors"
                >
                  Previous
                </a>
              )}
              <span className="px-4 py-2 text-sm text-foreground/50">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages && (
                <a
                  href={`/${locale}/people?page=${currentPage + 1}`}
                  className="px-4 py-2 bg-surface border border-border rounded-lg text-sm text-foreground/70 hover:text-white hover:bg-surface-hover transition-colors"
                >
                  Next
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import prisma from '@/lib/db';
import {formatDate} from '@/lib/format-date';
import SyncPanel from '@/components/admin/SyncPanel';

export const dynamic = 'force-dynamic';

type AdminPageProps = {
  params: Promise<{locale: string}>;
};

async function loadDashboardData() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [stats, recentUsers, lastSync, runningSyncs, bannedUserCount, staleMovies, staleTv, stalePersons, failedLogins] = await Promise.all([
    Promise.all([
      prisma.user.count(),
      prisma.movie.count(),
      prisma.tvSeries.count(),
      prisma.person.count(),
    ]).then(([users, movies, tvSeries, persons]) => ({
      users,
      movies,
      tvSeries,
      persons,
    })),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {createdAt: 'desc'},
      take: 10,
    }),
    prisma.syncLog.findFirst({orderBy: {startedAt: 'desc'}}),
    prisma.syncLog.count({where: {status: 'running'}}),
    prisma.user.count({where: {banned: true}}),
    prisma.movie.count({where: {OR: [{lastFetchedAt: null}, {lastFetchedAt: {lt: sevenDaysAgo}}]}}),
    prisma.tvSeries.count({where: {OR: [{lastFetchedAt: null}, {lastFetchedAt: {lt: sevenDaysAgo}}]}}),
    prisma.person.count({where: {OR: [{lastFetchedAt: null}, {lastFetchedAt: {lt: sevenDaysAgo}}]}}),
    prisma.loginLog.count({where: {success: false, createdAt: {gte: sevenDaysAgo}}}),
  ]);

  return {stats, recentUsers, lastSync, runningSyncs, bannedUserCount, staleMovies, staleTv, stalePersons, failedLogins};
}

export default async function AdminDashboardPage({params}: AdminPageProps) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Admin');

  const {stats, recentUsers, lastSync, runningSyncs, bannedUserCount, staleMovies, staleTv, stalePersons, failedLogins} = await loadDashboardData();

  const statCards = [
    {label: t('stats.users'), value: stats.users, href: '/admin/users'},
    {label: t('stats.movies'), value: stats.movies, href: '/admin/media?type=movies'},
    {label: t('stats.tvSeries'), value: stats.tvSeries, href: '/admin/media?type=tv'},
    {label: t('stats.persons'), value: stats.persons, href: '/admin/media?type=persons'},
  ];

  const adminSections = [
    {
      title: t('sections.users'),
      description: t('sections.usersDesc'),
      href: '/admin/users',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      title: t('sections.annotations'),
      description: t('sections.annotationsDesc'),
      href: '/admin/annotations',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.242 48.242 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      ),
    },
    {
      title: t('sections.media'),
      description: t('sections.mediaDesc'),
      href: '/admin/media',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5c0 .621-.504 1.125-1.125 1.125m1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M6 13.5v-1.5m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M6 13.5v1.5c0 .621.504 1.125 1.125 1.125h1.5" />
        </svg>
      ),
    },
    {
      title: t('sections.syncHistory'),
      description: t('sections.syncHistoryDesc'),
      href: '/admin/sync-history',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
        </svg>
      ),
    },
    {
      title: t('loginHistoryPage.title'),
      description: t('loginHistoryPage.subtitle'),
      href: '/admin/login-history',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      ),
    },
    {
      title: t('sections.watchlists'),
      description: t('sections.watchlistsDesc'),
      href: '/admin/watchlists',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{t('dashboard.title')}</h1>
        <p className="mt-1 text-foreground/60">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-surface border border-border rounded-xl p-5 hover:border-primary/40 transition-colors"
          >
            <p className="text-sm font-medium text-foreground/60">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-bold text-white">
              {card.value.toLocaleString()}
            </p>
          </Link>
        ))}
      </div>

      <div className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">{t('systemStatus')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-sm font-medium text-foreground/60">{t('lastSync')}</p>
            {lastSync ? (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-foreground/10 text-foreground/60">
                    {lastSync.entity}
                  </span>
                  <span
                    className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      lastSync.status === 'completed'
                        ? 'bg-green-500/15 text-green-400'
                        : lastSync.status === 'failed'
                          ? 'bg-red-500/15 text-red-400'
                          : 'bg-yellow-500/15 text-yellow-400'
                    }`}
                  >
                    {t(`syncHistoryPage.${lastSync.status}`)}
                  </span>
                </div>
                <p className="text-xs text-foreground/60">
                  {t('syncHistoryPage.processed')}: {lastSync.processed} | {t('syncHistoryPage.errors')}: {lastSync.errors}
                </p>
                <p className="text-xs text-foreground/60">{formatDate(lastSync.startedAt, locale)}</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-foreground/60">{t('neverSynced')}</p>
            )}
          </div>

          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-sm font-medium text-foreground/60">{t('syncHistoryPage.running')}</p>
            {runningSyncs > 0 ? (
              <div className="mt-2 flex items-center gap-2 text-sm text-yellow-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
                </span>
                {t('runningNow')}
              </div>
            ) : (
              <p className="mt-2 text-sm text-foreground/60">—</p>
            )}
          </div>

          <Link
            href="/admin/users"
            className="bg-surface border border-border rounded-xl p-4 hover:border-primary/40 transition-colors"
          >
            <p className="text-sm font-medium text-foreground/60">{t('bannedUsers')}</p>
            <p className="mt-2 text-2xl font-bold text-white">{bannedUserCount.toLocaleString()}</p>
          </Link>

          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-sm font-medium text-foreground/60">{t('staleContent')}</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {(staleMovies + staleTv + stalePersons).toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-foreground/60">
              {staleMovies} {t('staleMovie')} · {staleTv} {t('staleTv')} · {stalePersons} {t('stalePerson')}
            </p>
          </div>

          <Link
            href="/admin/login-history"
            className="bg-surface border border-border rounded-xl p-4 hover:border-primary/40 transition-colors"
          >
            <p className="text-sm font-medium text-foreground/60">{t('failedLogins')}</p>
            <p className={`mt-2 text-2xl font-bold ${failedLogins > 0 ? 'text-red-400' : 'text-white'}`}>
              {failedLogins.toLocaleString()}
            </p>
          </Link>
        </div>
      </div>

      {/* Admin Sections */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">{t('dashboard.management')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminSections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="bg-surface border border-border rounded-xl p-5 hover:border-primary/40 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="text-foreground/40 group-hover:text-primary transition-colors">
                  {section.icon}
                </div>
                <div>
                  <h3 className="font-medium text-white group-hover:text-primary transition-colors">
                    {section.title}
                  </h3>
                  <p className="mt-1 text-sm text-foreground/50">
                    {section.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden mb-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-white">{t('recentUsers')}</h2>
          <Link
            href="/admin/users"
            className="text-sm text-primary hover:text-primary-hover transition-colors"
          >
            {t('viewAll')}
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('name')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('email')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('role')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('joined')}
                </th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-6 py-3 text-foreground">
                    {user.name ?? '—'}
                  </td>
                  <td className="px-6 py-3 text-foreground/70">
                    {user.email}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        user.role === 'ADMIN'
                          ? 'bg-primary/15 text-primary'
                          : 'bg-foreground/10 text-foreground/60'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-foreground/60">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
              {recentUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-foreground/40"
                  >
                    {t('noUsers')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sync Panel */}
      <SyncPanel />
    </div>
  );
}

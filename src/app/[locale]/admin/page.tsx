import {setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import prisma from '@/lib/db';
import SyncPanel from '@/components/admin/SyncPanel';

export const dynamic = 'force-dynamic';

type AdminPageProps = {
  params: Promise<{locale: string}>;
};

export default async function AdminDashboardPage({params}: AdminPageProps) {
  const {locale} = await params;
  setRequestLocale(locale);

  const [stats, recentUsers] = await Promise.all([
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
  ]);

  const statCards = [
    {label: 'Users', value: stats.users, href: '/admin/users'},
    {label: 'Movies', value: stats.movies, href: '/movies'},
    {label: 'TV Series', value: stats.tvSeries, href: '/tv-series'},
    {label: 'Persons', value: stats.persons, href: '/people'},
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-1 text-foreground/60">
          Manage users and monitor system status.
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

      {/* Recent Users */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden mb-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-white">Recent Users</h2>
          <Link
            href="/admin/users"
            className="text-sm text-primary hover:text-primary-hover transition-colors"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  Name
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  Email
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  Role
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  Joined
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
                    No users found.
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

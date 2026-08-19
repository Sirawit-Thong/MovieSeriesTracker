'use client';

import {useEffect, useState, useCallback} from 'react';
import {Link} from '@/i18n/navigation';
import {useLocale, useTranslations} from 'next-intl';
import {formatDate} from '@/lib/format-date';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminSpinner from '@/components/admin/AdminSpinner';
import AdminEmptyState from '@/components/admin/AdminEmptyState';

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  banned: boolean;
  createdAt: string;
};

type UsersResponse = {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export default function AdminUsersPage() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const [data, setData] = useState<UsersResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [role, setRole] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchUsers = useCallback(
    async (p: number, searchQuery: string, roleFilter: string) => {
      try {
        const params = new URLSearchParams({page: String(p)});
        if (searchQuery) params.set('search', searchQuery);
        if (roleFilter) params.set('role', roleFilter);
        const res = await fetch(`/api/admin/users?${params.toString()}`);
        if (res.ok) {
          const nextData: UsersResponse = await res.json();
          return nextData;
        }
        return null;
      } catch {
        return null;
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    fetchUsers(page, debouncedSearch, role)
      .then((nextData) => {
        if (!cancelled) {
          if (nextData) {
            setData(nextData);
            setError(null);
          } else {
            setError(t('loadError'));
          }
        }
      })
      .catch(() => {
        if (!cancelled) setError(t('loadError'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, fetchUsers, debouncedSearch, role, t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  function handleRoleFilter(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setRole(value);
    setPage(1);
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setUpdatingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({userId, role: newRole}),
      });

      if (res.ok) {
        setActionError(null);
        const nextData = await fetchUsers(page, debouncedSearch, role);
        if (nextData) {
          setData(nextData);
          setError(null);
        } else {
          setError(t('loadError'));
        }
      } else {
        setActionError(t('actionError'));
      }
    } catch {
      setActionError(t('actionError'));
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleBanToggle(userId: string, currentBanned: boolean) {
    setUpdatingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({userId, banned: !currentBanned}),
      });

      if (res.ok) {
        setActionError(null);
        const nextData = await fetchUsers(page, debouncedSearch, role);
        if (nextData) {
          setData(nextData);
          setError(null);
        } else {
          setError(t('loadError'));
        }
      } else {
        setActionError(t('actionError'));
      }
    } catch {
      setActionError(t('actionError'));
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(userId: string) {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDeleteConfirmId(null);
        setActionError(null);
        const nextData = await fetchUsers(page, debouncedSearch, role);
        if (nextData) {
          setData(nextData);
          setError(null);
        } else {
          setError(t('loadError'));
        }
        if (nextData && nextData.page > nextData.totalPages) {
          setPage(Math.max(1, nextData.totalPages));
        }
      } else {
        setActionError(t('actionError'));
      }
    } catch {
      setActionError(t('actionError'));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/admin"
            className="text-foreground/60 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-white">{t('usersPage.title')}</h1>
        </div>
        <p className="mt-1 text-foreground/60">
          {t('usersPage.subtitle')}
        </p>
      </div>

      {/* Search & Role Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            className="flex-1 px-4 py-2 text-sm rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/80 transition-colors"
          >
            {t('searchButton')}
          </button>
        </form>
        <select
          value={role}
          onChange={handleRoleFilter}
          className="px-3 py-2 text-sm rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-primary/50 transition-colors"
        >
          <option value="">{t('allRoles')}</option>
          <option value="USER">{t('user')}</option>
          <option value="ADMIN">{t('admin')}</option>
        </select>
      </div>

      {(error || actionError) && (
        <div className="mb-4 px-4 py-3 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg">
          {error ?? actionError}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
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
                  {t('status')}
                </th>
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  {t('joined')}
                </th>
                <th className="text-right px-6 py-3 text-foreground/50 font-medium">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && !data && (
                <tr>
                  <td colSpan={6}>
                    <AdminSpinner label={t('loadingUsers')} />
                  </td>
                </tr>
              )}
              {data?.users.map((user) => (
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
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      disabled={updatingId === user.id}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 ${
                        user.role === 'ADMIN'
                          ? 'text-primary'
                          : 'text-foreground/60'
                      }`}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
                        user.banned
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}
                    >
                      {user.banned ? t('banned') : t('active')}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-foreground/60">
                    {formatDate(user.createdAt, locale)}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {deleteConfirmId === user.id ? (
                        <>
                          <span className="text-xs text-foreground/50 mr-2">
                            {t('delete')}?
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDelete(user.id)}
                            disabled={updatingId === user.id}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                          >
                            {t('confirm')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-background border border-border text-foreground/60 hover:text-foreground transition-colors"
                          >
                            {t('cancel')}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleBanToggle(user.id, user.banned)}
                            disabled={updatingId === user.id}
                            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 ${
                              user.banned
                                ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30'
                            }`}
                          >
                            {user.banned ? t('unbanUser') : t('banUser')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(user.id)}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                          >
                            {t('delete')}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {data && data.users.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <AdminEmptyState message={t('noUsers')} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && (
          <AdminPagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}

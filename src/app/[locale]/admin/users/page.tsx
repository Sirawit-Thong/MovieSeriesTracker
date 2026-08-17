'use client';

import {useEffect, useState, useCallback} from 'react';
import {Link} from '@/i18n/navigation';

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
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
  const [data, setData] = useState<UsersResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${p}`);
      if (res.ok) {
        setData(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page);
  }, [page, fetchUsers]);

  async function handleRoleChange(userId: string, newRole: string) {
    setUpdatingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({userId, role: newRole}),
      });

      if (res.ok) {
        // Refresh the list
        await fetchUsers(page);
      }
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
          <h1 className="text-3xl font-bold text-white">User Management</h1>
        </div>
        <p className="mt-1 text-foreground/60">
          View and manage user accounts and roles.
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
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
                <th className="text-left px-6 py-3 text-foreground/50 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && !data && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-foreground/40"
                  >
                    Loading...
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
                  <td className="px-6 py-3 text-foreground/60">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      type="button"
                      disabled
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-background border border-border text-foreground/40 cursor-not-allowed"
                      title="Ban (coming soon)"
                    >
                      Ban
                    </button>
                  </td>
                </tr>
              ))}
              {data && data.users.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-foreground/40"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-foreground/50">
              Page {data.page} of {data.totalPages} ({data.total} users)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm rounded-lg bg-background border border-border text-foreground/70 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((p) => Math.min(data.totalPages, p + 1))
                }
                disabled={page >= data.totalPages}
                className="px-3 py-1.5 text-sm rounded-lg bg-background border border-border text-foreground/70 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

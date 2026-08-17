'use client';

import {useState, useEffect} from 'react';
import Link from 'next/link';
import {useSession} from 'next-auth/react';

type Watchlist = {
  id: number;
  name: string;
  description: string | null;
  itemCount: number;
  updatedAt: string;
};

type WatchlistItem = {
  id: number;
  entityType: string;
  entityId: number;
};

type Translations = {
  title: string;
  subtitle: string;
  create: string;
  edit: string;
  delete: string;
  name: string;
  description: string;
  items: string;
  empty: string;
  emptyDescription: string;
  confirmDelete: string;
  confirmDeleteDescription: string;
  cancel: string;
  save: string;
  addToWatchlist: string;
  removeFromWatchlist: string;
};

type Props = {
  locale: string;
  translations: Translations;
};

export default function WatchlistContent({locale, translations: t}: Props) {
  const {data: session} = useSession();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingWatchlist, setEditingWatchlist] = useState<Watchlist | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    if (!session?.user) return;
    fetchWatchlists();
  }, [session]);

  async function fetchWatchlists() {
    try {
      const res = await fetch('/api/watchlists');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setWatchlists(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate() {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/watchlists', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: name.trim(), description: description.trim() || null}),
      });
      if (res.ok) {
        setShowCreateDialog(false);
        setName('');
        setDescription('');
        fetchWatchlists();
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdate() {
    if (!editingWatchlist || !name.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/watchlists/${editingWatchlist.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: name.trim(), description: description.trim() || null}),
      });
      if (res.ok) {
        setEditingWatchlist(null);
        setName('');
        setDescription('');
        fetchWatchlists();
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/watchlists/${id}`, {method: 'DELETE'});
      if (res.ok) {
        setDeleteConfirm(null);
        fetchWatchlists();
      }
    } catch {
      // ignore
    }
  }

  function openEdit(wl: Watchlist) {
    setEditingWatchlist(wl);
    setName(wl.name);
    setDescription(wl.description ?? '');
    setShowCreateDialog(false);
  }

  function closeDialog() {
    setShowCreateDialog(false);
    setEditingWatchlist(null);
    setName('');
    setDescription('');
  }

  if (!session?.user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-foreground/50">Please sign in to manage your watchlists.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-foreground/50">{t.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => { setShowCreateDialog(true); setEditingWatchlist(null); setName(''); setDescription(''); }}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
        >
          + {t.create}
        </button>
      </div>

      {/* Create / Edit Dialog */}
      {(showCreateDialog || editingWatchlist) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingWatchlist ? t.edit : t.create}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5">
                  {t.name}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="My Watchlist"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5">
                  {t.description}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Optional description"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="px-4 py-2 text-sm text-foreground/60 hover:text-white transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={editingWatchlist ? handleUpdate : handleCreate}
                  disabled={!name.trim() || isSaving}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg
                    transition-colors disabled:opacity-50"
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-semibold text-white mb-2">{t.confirmDelete}</h2>
            <p className="text-sm text-foreground/50 mb-6">{t.confirmDeleteDescription}</p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-foreground/60 hover:text-white transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({length: 4}).map((_, i) => (
            <div key={i} className="animate-pulse h-20 bg-surface rounded-lg" />
          ))}
        </div>
      ) : watchlists.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-foreground/70 mb-2">{t.empty}</p>
          <p className="text-sm text-foreground/40">{t.emptyDescription}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {watchlists.map((wl) => (
            <div
              key={wl.id}
              className="bg-surface border border-border rounded-lg p-4 hover:bg-surface-hover transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{wl.name}</h3>
                  {wl.description && (
                    <p className="text-sm text-foreground/40 truncate mt-0.5">{wl.description}</p>
                  )}
                  <p className="text-xs text-foreground/30 mt-1">
                    {wl.itemCount} {t.items}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link
                    href={`/${locale}/watchlists/${wl.id}`}
                    className="px-3 py-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => openEdit(wl)}
                    className="px-3 py-1.5 text-xs font-medium text-foreground/50 hover:text-white transition-colors"
                  >
                    {t.edit}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(wl.id)}
                    className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                  >
                    {t.delete}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

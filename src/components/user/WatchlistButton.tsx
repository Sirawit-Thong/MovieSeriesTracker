'use client';

import {useState, useRef, useEffect, useCallback} from 'react';
import {useTranslations} from 'next-intl';

type Watchlist = {
  id: number;
  name: string;
  description: string | null;
  itemCount: number;
};

type WatchlistButtonProps = {
  entityType: 'MOVIE' | 'TV' | 'PERSON';
  entityId: number;
  /** IDs of watchlists that already contain this entity. */
  initialWatchlistIds?: number[];
  onWatchlistChange?: (watchlistIds: number[]) => void;
};

export default function WatchlistButton({
  entityType,
  entityId,
  initialWatchlistIds = [],
  onWatchlistChange,
}: WatchlistButtonProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [inWatchlistIds, setInWatchlistIds] = useState<Set<number>>(
    new Set(initialWatchlistIds)
  );
  const [isLoadingWatchlists, setIsLoadingWatchlists] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowCreateInput(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Fetch watchlists when dropdown opens
  const fetchWatchlists = useCallback(async () => {
    setIsLoadingWatchlists(true);
    try {
      const res = await fetch('/api/watchlists');
      if (!res.ok) throw new Error('Failed to fetch watchlists');
      const data: Watchlist[] = await res.json();
      setWatchlists(data);

      // Determine which watchlists contain this entity
      const ids: number[] = [];
      for (const wl of data) {
        try {
          const wlRes = await fetch(`/api/watchlists/${wl.id}`);
          if (!wlRes.ok) continue;
          const wlData = await wlRes.json();
          const hasItem = wlData.items?.some(
            (item: {entityType: string; entityId: number}) =>
              item.entityType === entityType && item.entityId === entityId
          );
          if (hasItem) ids.push(wl.id);
        } catch {
          // Skip failed fetch
        }
      }
      setInWatchlistIds(new Set(ids));
      onWatchlistChange?.(ids);
    } catch {
      // Failed to load watchlists
    } finally {
      setIsLoadingWatchlists(false);
    }
  }, [entityType, entityId, onWatchlistChange]);

  function handleToggle() {
    if (!isOpen) {
      fetchWatchlists();
    }
    setIsOpen(!isOpen);
  }

  async function handleToggleWatchlist(watchlistId: number) {
    const isCurrentlyIn = inWatchlistIds.has(watchlistId);

    // Optimistic update
    const newIds = new Set(inWatchlistIds);
    if (isCurrentlyIn) {
      newIds.delete(watchlistId);
    } else {
      newIds.add(watchlistId);
    }
    setInWatchlistIds(newIds);
    onWatchlistChange?.(Array.from(newIds));

    setIsSaving(true);
    try {
      if (isCurrentlyIn) {
        const res = await fetch(
          `/api/watchlists/${watchlistId}/items?entityType=${entityType}&entityId=${entityId}`,
          {method: 'DELETE'}
        );
        if (!res.ok) throw new Error('Failed to remove');
      } else {
        const res = await fetch(`/api/watchlists/${watchlistId}/items`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({entityType, entityId}),
        });
        if (!res.ok) throw new Error('Failed to add');
      }
    } catch {
      // Revert on failure
      setInWatchlistIds(inWatchlistIds);
      onWatchlistChange?.(Array.from(inWatchlistIds));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateWatchlist() {
    if (!newWatchlistName.trim()) return;

    setIsSaving(true);
    try {
      const createRes = await fetch('/api/watchlists', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: newWatchlistName.trim()}),
      });
      if (!createRes.ok) throw new Error('Failed to create');
      const newWatchlist: Watchlist = await createRes.json();

      // Add entity to the new watchlist
      const addRes = await fetch(`/api/watchlists/${newWatchlist.id}/items`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({entityType, entityId}),
      });
      if (!addRes.ok) throw new Error('Failed to add to new watchlist');

      // Update local state
      setWatchlists((prev) => [{...newWatchlist, itemCount: 1}, ...prev]);
      const newIds = new Set(inWatchlistIds);
      newIds.add(newWatchlist.id);
      setInWatchlistIds(newIds);
      onWatchlistChange?.(Array.from(newIds));

      setNewWatchlistName('');
      setShowCreateInput(false);
    } catch {
      // Failed to create watchlist
    } finally {
      setIsSaving(false);
    }
  }

  const isInAnyWatchlist = inWatchlistIds.size > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isSaving}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
          border transition-colors text-sm font-medium
          ${isInAnyWatchlist
            ? 'border-primary/50 bg-primary/10 text-primary hover:bg-primary/20'
            : 'border-border bg-surface hover:bg-surface-hover text-foreground/70 hover:text-foreground'
          }
          ${isSaving ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
      >
        {isInAnyWatchlist ? (
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.75 10.818c-.09.003-.438.05-.572.047a.798.798 0 01-.471-.184.801.801 0 01-.298-.288c-.018-.023-.035-.043-.053-.065a.668.668 0 01-.126-.555c.003-.064.028-.13.084-.199.056-.069.143-.12.251-.147a1.42 1.42 0 01.445-.097c.15-.013.31-.01.458.01a.795.795 0 01.363.133c.084.06.15.138.196.231.045.09.07.193.073.3a.8.8 0 01-.024.195.798.798 0 01-.217.34.8.8 0 01-.352.216 1.34 1.34 0 01-.463.063c-.153.008-.308-.014-.443-.066a1.33 1.33 0 01-.43-.243.796.796 0 01-.264-.368.798.798 0 01-.048-.45c.009-.072.034-.142.075-.207a.798.798 0 01.2-.175c.08-.058.176-.1.285-.118.11-.018.224-.01.333.025.11.035.212.097.3.181.086.081.158.18.21.29a.8.8 0 01.037.428.8.8 0 01-.13.277.801.801 0 01-.3.225c-.123.054-.26.082-.398.082a1.55 1.55 0 01-.48-.079 1.42 1.42 0 01-.448-.25.798.798 0 01-.273-.384.8.8 0 01-.028-.417c.019-.082.055-.158.105-.226a.8.8 0 01.19-.192c.084-.062.181-.102.285-.117.107-.016.215-.005.32.033.103.036.198.096.281.176.082.078.147.173.193.28a.8.8 0 01.027.407.8.8 0 01-.127.288.8.8 0 01-.298.267 1.36 1.36 0 01-.45.115c-.15.012-.304-.007-.442-.057a1.3 1.3 0 01-.42-.228.798.798 0 01-.26-.364.8.8 0 01-.047-.442c.011-.072.036-.14.077-.203a.8.8 0 01.2-.175z" />
            <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a6.97 6.97 0 01-.258-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.478c.08-.185.167-.36.258-.521z" clipRule="evenodd" />
          </svg>
        )}
        <span>{t('annotation.addToWatchlist')}</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-surface border border-border rounded-lg shadow-xl overflow-hidden">
          {isLoadingWatchlists ? (
            <div className="px-3 py-4 text-center">
              <svg className="w-5 h-5 animate-spin mx-auto text-foreground/40" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : (
            <>
              {watchlists.length === 0 && !showCreateInput ? (
                <div className="px-3 py-3 text-center">
                  <p className="text-sm text-foreground/40 mb-2">No watchlists yet</p>
                  <button
                    type="button"
                    onClick={() => setShowCreateInput(true)}
                    className="text-sm text-primary hover:text-primary-hover transition-colors"
                  >
                    {t('annotation.addToWatchlist')}
                  </button>
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto">
                  {watchlists.map((wl) => {
                    const isIn = inWatchlistIds.has(wl.id);
                    return (
                      <button
                        key={wl.id}
                        type="button"
                        onClick={() => handleToggleWatchlist(wl.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors
                          ${isIn ? 'bg-primary/10 text-primary' : 'text-foreground/70 hover:bg-surface-hover'}`}
                      >
                        {isIn ? (
                          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <div className="w-4 h-4 flex-shrink-0 rounded border border-foreground/20" />
                        )}
                        <span className="truncate">{wl.name}</span>
                        <span className="ml-auto text-xs text-foreground/30">{wl.itemCount}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Create new watchlist */}
              {showCreateInput ? (
                <div className="border-t border-border px-3 py-2">
                  <input
                    type="text"
                    value={newWatchlistName}
                    onChange={(e) => setNewWatchlistName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateWatchlist();
                      if (e.key === 'Escape') {
                        setShowCreateInput(false);
                        setNewWatchlistName('');
                      }
                    }}
                    placeholder="Watchlist name..."
                    autoFocus
                    className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded
                      text-foreground/90 placeholder:text-foreground/30
                      focus:outline-none focus:border-primary/50"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handleCreateWatchlist}
                      disabled={!newWatchlistName.trim() || isSaving}
                      className="flex-1 px-2 py-1 text-xs font-medium bg-primary text-white rounded
                        hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowCreateInput(false); setNewWatchlistName(''); }}
                      className="flex-1 px-2 py-1 text-xs font-medium bg-surface-hover text-foreground/70 rounded
                        hover:bg-border transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCreateInput(true)}
                  className="w-full px-3 py-2.5 text-sm text-foreground/50 hover:text-foreground/70
                    hover:bg-surface-hover transition-colors border-t border-border
                    flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  Create new watchlist
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

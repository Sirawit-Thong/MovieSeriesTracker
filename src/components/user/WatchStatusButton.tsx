'use client';

import {useState, useRef, useEffect} from 'react';
import {useTranslations} from 'next-intl';

type WatchStatus = 'WATCHED' | 'WATCHING' | 'WANT_TO_WATCH' | 'DROPPED';

type WatchStatusButtonProps = {
  entityType: 'MOVIE' | 'TV' | 'PERSON';
  entityId: number;
  initialStatus?: WatchStatus | null;
  onStatusChange?: (status: WatchStatus | null) => void;
};

const STATUS_OPTIONS: {
  value: WatchStatus;
  icon: string;
  color: string;
  hoverColor: string;
}[] = [
  {
    value: 'WATCHED',
    icon: '✓',
    color: 'text-green-400',
    hoverColor: 'hover:bg-green-400/10',
  },
  {
    value: 'WATCHING',
    icon: '▶',
    color: 'text-blue-400',
    hoverColor: 'hover:bg-blue-400/10',
  },
  {
    value: 'WANT_TO_WATCH',
    icon: '☆',
    color: 'text-yellow-400',
    hoverColor: 'hover:bg-yellow-400/10',
  },
  {
    value: 'DROPPED',
    icon: '✕',
    color: 'text-red-400',
    hoverColor: 'hover:bg-red-400/10',
  },
];

/** Get the translation key for a watch status value. */
function getStatusTranslationKey(status: WatchStatus): string {
  switch (status) {
    case 'WATCHED':
      return 'annotation.watched';
    case 'WATCHING':
      return 'annotation.watching';
    case 'WANT_TO_WATCH':
      return 'annotation.wantToWatch';
    case 'DROPPED':
      return 'annotation.dropped';
  }
}

export default function WatchStatusButton({
  entityType,
  entityId,
  initialStatus = null,
  onStatusChange,
}: WatchStatusButtonProps) {
  const t = useTranslations();
  const [currentStatus, setCurrentStatus] = useState<WatchStatus | null>(initialStatus);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  async function handleStatusSelect(status: WatchStatus) {
    const newStatus = currentStatus === status ? null : status;
    setCurrentStatus(newStatus);
    setIsOpen(false);
    onStatusChange?.(newStatus);

    setIsSaving(true);
    try {
      await fetch('/api/annotations', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({entityType, entityId, watchStatus: newStatus}),
      });
    } catch {
      // Revert on failure
      setCurrentStatus(currentStatus);
      onStatusChange?.(currentStatus);
    } finally {
      setIsSaving(false);
    }
  }

  const activeOption = STATUS_OPTIONS.find((o) => o.value === currentStatus);

  return (
    <div className="relative" ref={dropdownRef}>
      <span className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">
        {t('annotation.watchStatus')}
      </span>

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSaving}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg
          border border-border bg-surface hover:bg-surface-hover transition-colors
          text-sm ${activeOption ? activeOption.color : 'text-foreground/70'}
          ${isSaving ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
      >
        <span className="flex items-center gap-2">
          {activeOption && <span className="text-base">{activeOption.icon}</span>}
          <span>{activeOption ? t(getStatusTranslationKey(activeOption.value)) : t('annotation.watchStatus')}</span>
        </span>
        <svg
          className={`w-4 h-4 text-foreground/40 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-surface border border-border rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleStatusSelect(option.value)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors
                ${option.hoverColor} ${option.color}
                ${currentStatus === option.value ? 'bg-white/5 font-medium' : 'text-foreground/70'}`}
            >
              <span className="text-base w-5 text-center">{option.icon}</span>
              <span>{t(getStatusTranslationKey(option.value))}</span>
              {currentStatus === option.value && (
                <svg className="w-4 h-4 ml-auto" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

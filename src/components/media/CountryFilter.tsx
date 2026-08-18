'use client';

import {useState, useRef, useEffect, useMemo} from 'react';
import {useLocale} from 'next-intl';
import {getDisplayName, searchCountries} from '@/lib/i18n/country-names';

type Country = {
  iso31661: string;
  name: string;
  movieCount: number;
  tvCount: number;
  totalCount: number;
};

type CountryFilterProps = {
  countries: Country[];
  value: string[];
  onChange: (codes: string[]) => void;
  label?: string;
};

export default function CountryFilter({
  countries,
  value,
  onChange,
  label = 'Country',
}: CountryFilterProps) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  const filtered = useMemo(() => {
    const list = search
      ? searchCountries(countries, search, locale)
      : countries;
    const selected = list.filter((c) => value.includes(c.iso31661));
    const unselected = list.filter((c) => !value.includes(c.iso31661));
    return [...selected, ...unselected];
  }, [countries, search, locale, value]);

  const toggle = (code: string) => {
    if (value.includes(code)) {
      onChange(value.filter((v) => v !== code));
    } else {
      onChange([...value, code]);
    }
  };

  const selectedCount = value.length;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
          selectedCount > 0
            ? 'bg-primary/20 border-primary/50 text-primary'
            : 'bg-surface border-border text-foreground/70 hover:text-white hover:bg-surface-hover'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {label}
        {selectedCount > 0 && (
          <span className="bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {selectedCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-64 bg-surface border border-border rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={locale === 'th' ? 'ค้นหาประเทศ...' : 'Search countries...'}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-foreground/40 text-center">
                {locale === 'th' ? 'ไม่พบประเทศ' : 'No countries found'}
              </div>
            ) : (
              filtered.map((c) => {
                const checked = value.includes(c.iso31661);
                return (
                  <button
                    key={c.iso31661}
                    type="button"
                    onClick={() => toggle(c.iso31661)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors ${
                      checked
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground/70 hover:bg-surface-hover hover:text-white'
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-4 h-4 rounded border transition-colors flex items-center justify-center ${
                        checked
                          ? 'bg-primary border-primary'
                          : 'border-border bg-background'
                      }`}
                    >
                      {checked && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className="truncate">{getDisplayName(c.iso31661, c.name, locale)}</span>
                    {c.totalCount > 0 && (
                      <span className="ml-auto flex-shrink-0 text-[10px] text-foreground/30 tabular-nums">
                        {c.totalCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
          {selectedCount > 0 && (
            <div className="p-2 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  onChange([]);
                  setSearch('');
                }}
                className="w-full px-3 py-1.5 text-xs text-foreground/50 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
              >
                {locale === 'th' ? `ล้างทั้งหมด (${selectedCount})` : `Clear all (${selectedCount})`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

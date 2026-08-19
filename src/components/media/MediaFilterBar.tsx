'use client';

import {useRouter, usePathname} from '@/i18n/navigation';
import {useSearchParams} from 'next/navigation';
import {useLocale} from 'next-intl';
import CountryFilter from '@/components/media/CountryFilter';
import {getDisplayName} from '@/lib/i18n/country-names';
import {useMemo} from 'react';

type Country = {
  iso31661: string;
  name: string;
  movieCount: number;
  tvCount: number;
  totalCount: number;
};

type MediaFilterBarProps = {
  countries: Country[];
  basePath: string;
};

export default function MediaFilterBar({countries, basePath: _basePath}: MediaFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const selectedCountries = searchParams.getAll('country');

  // Top 5 countries by count (excluding already-selected ones from the quick list)
  const topCountries = useMemo(() => {
    return countries
      .filter((c) => c.totalCount > 0 && !selectedCountries.includes(c.iso31661))
      .slice(0, 5);
  }, [countries, selectedCountries]);

  const updateCountries = (codes: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('country');
    params.delete('page');
    codes.forEach((c) => params.append('country', c));
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ''}`);
    // Persist to localStorage for restore on next visit
    try {
      localStorage.setItem('media-country-filter', JSON.stringify({
        codes,
        path: pathname,
      }));
    } catch {}
  };

  const removeCountry = (code: string) => {
    updateCountries(selectedCountries.filter((c) => c !== code));
  };

  const addCountry = (code: string) => {
    updateCountries([...selectedCountries, code]);
  };

  const countryMap = new Map(countries.map((c: Country) => [c.iso31661, c.name]));

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <CountryFilter
          countries={countries}
          value={selectedCountries}
          onChange={updateCountries}
        />
        {selectedCountries.map((code) => {
          const englishName = countryMap.get(code) ?? code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => removeCountry(code)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors"
            >
              {getDisplayName(code, englishName, locale)}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          );
        })}
      </div>
      {/* Quick-select top countries */}
      {topCountries.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {topCountries.map((c) => (
            <button
              key={c.iso31661}
              type="button"
              onClick={() => addCountry(c.iso31661)}
              className="px-2 py-0.5 text-[11px] rounded-full border border-border text-foreground/50 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-colors"
            >
              + {getDisplayName(c.iso31661, c.name, locale)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

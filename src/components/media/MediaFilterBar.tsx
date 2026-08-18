'use client';

import {useRouter, usePathname} from '@/i18n/navigation';
import {useSearchParams} from 'next/navigation';
import {useLocale} from 'next-intl';
import CountryFilter from '@/components/media/CountryFilter';
import {getDisplayName} from '@/lib/i18n/country-names';

type Country = {
  iso31661: string;
  name: string;
};

type MediaFilterBarProps = {
  countries: Country[];
  basePath: string;
};

export default function MediaFilterBar({countries, basePath}: MediaFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const selectedCountries = searchParams.getAll('country');
  const currentGenre = searchParams.get('genre');

  const updateCountries = (codes: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('country');
    params.delete('page');
    codes.forEach((c) => params.append('country', c));
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ''}`);
  };

  const removeCountry = (code: string) => {
    updateCountries(selectedCountries.filter((c) => c !== code));
  };

  const countryMap = new Map(countries.map((c: Country) => [c.iso31661, c.name]));

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
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
  );
}

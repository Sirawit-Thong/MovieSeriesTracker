'use client';

import {useEffect} from 'react';
import {useRouter, usePathname} from '@/i18n/navigation';
import {useSearchParams} from 'next/navigation';

/**
 * Restores country filter from localStorage when the page loads without URL params.
 * Place this on Movies/TV listing pages to persist user's last country selection.
 */
export default function CountryFilterRestore() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only restore if no country params in URL
    if (searchParams.getAll('country').length > 0) return;

    try {
      const raw = localStorage.getItem('media-country-filter');
      if (!raw) return;
      const {codes, path} = JSON.parse(raw);
      if (!Array.isArray(codes) || codes.length === 0) return;
      // Only restore for the same page type (movies or tv-series)
      if (path && !pathname.startsWith(path.split('?')[0])) return;

      const params = new URLSearchParams();
      codes.forEach((c: string) => params.append('country', c));
      router.replace(`${pathname}?${params.toString()}`);
    } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

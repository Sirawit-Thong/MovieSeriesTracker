import {useLocale, useTranslations} from 'next-intl';
import {translateStatus} from '@/lib/crew-translations';

type MovieInfoProps = {
  movie: {
    status: string | null;
    releaseDate: Date | null;
    runtime: number | null;
    budget: number | null;
    revenue: number | null;
    originalLanguage: string;
    productionCountries: Array<{country: {iso31661: string; name: string}}>;
  };
};

/** Format a number as compact currency (e.g. $123M). */
function formatCompactCurrency(value: number | null): string {
  if (!value || value === 0) return '—';
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value}`;
}

/** Format runtime as "Xh Ym". */
function formatRuntime(minutes: number | null): string {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/** Format release date using the given locale. */
function formatDate(date: Date | null, locale: string): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Sidebar displaying key movie information:
 * status, release date, runtime, budget, revenue,
 * original language, origin country, and external links.
 */
export default function MovieInfo({movie}: MovieInfoProps) {
  const t = useTranslations('Movie');
  const locale = useLocale();

  const countries = movie.productionCountries.map((pc) => pc.country);

  return (
    <div className="bg-surface rounded-lg border border-border p-6 space-y-5 sticky top-24">
      {/* Status */}
      <InfoRow label={t('status')} value={translateStatus(movie.status, locale)} />

      {/* Release Date */}
      <InfoRow label={t('releaseDate')} value={formatDate(movie.releaseDate, locale)} />

      {/* Runtime */}
      <InfoRow label={t('runtime')} value={formatRuntime(movie.runtime)} />

      {/* Budget */}
      <InfoRow
        label={t('budget')}
        value={formatCompactCurrency(movie.budget)}
      />

      {/* Revenue */}
      <InfoRow
        label={t('revenue')}
        value={formatCompactCurrency(movie.revenue)}
      />

      {/* Original Language */}
      <InfoRow
        label={t('originalLanguage')}
        value={movie.originalLanguage.toUpperCase()}
      />

      {/* Origin Country */}
      <InfoRow
        label={t('originCountry')}
        value={
          countries.length > 0
            ? countries.map((c) => c.name).join(', ')
            : '—'
        }
      />

      {/* External links are now handled by the ExternalLinks component in MovieDetail */}
    </div>
  );
}

/** Reusable label/value row for the sidebar. */
function InfoRow({label, value}: {label: string; value: string}) {
  return (
    <div>
      <span className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1">
        {label}
      </span>
      <span className="text-sm text-foreground/90">{value}</span>
    </div>
  );
}

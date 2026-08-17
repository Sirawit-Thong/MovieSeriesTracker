'use client';

import {useLocale, useTranslations} from 'next-intl';
import {translateDepartment} from '@/lib/crew-translations';

type PersonInfoProps = {
  person: {
    knownForDepartment: string | null;
    birthday: string | null;
    deathday: string | null;
    placeOfBirth: string | null;
    gender: number;
    alsoKnownAs: string | null;
    imdbId: string | null;
  };
};

/** Format a date string using the given locale. */
function formatDate(dateStr: string | null, locale: string): string {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

/** Format gender number to readable string. */
function formatGender(gender: number, t: ReturnType<typeof useTranslations>): string {
  switch (gender) {
    case 1:
      return t('genderFemale');
    case 2:
      return t('genderMale');
    case 3:
      return t('genderNonBinary');
    default:
      return '—';
  }
}

/**
 * Sidebar displaying key person information:
 * known for department, birthday, deathday, place of birth,
 * gender, also known as, and IMDb link.
 */
export default function PersonInfo({person}: PersonInfoProps) {
  const t = useTranslations('Person');
  const locale = useLocale();

  /** Split comma-separated alsoKnownAs into an array. */
  const aliases = person.alsoKnownAs
    ? person.alsoKnownAs
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="bg-surface rounded-lg border border-border p-6 space-y-5 sticky top-24">
      {/* Known For Department */}
      <InfoRow label={t('knownFor')} value={translateDepartment(person.knownForDepartment, locale) || '—'} />

      {/* Birthday */}
      <InfoRow label={t('born')} value={formatDate(person.birthday, locale)} />

      {/* Deathday (if applicable) */}
      {person.deathday && (
        <InfoRow label={t('died')} value={formatDate(person.deathday, locale)} />
      )}

      {/* Place of Birth */}
      <InfoRow label={t('placeOfBirth')} value={person.placeOfBirth ?? '—'} />

      {/* Gender */}
      <InfoRow label={t('gender')} value={formatGender(person.gender, t)} />

      {/* Also Known As */}
      {aliases.length > 0 && (
        <div>
          <span className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1">
            {t('alsoKnownAs')}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {aliases.map((alias) => (
              <span
                key={alias}
                className="px-2 py-0.5 text-xs bg-muted border border-border rounded-full text-foreground/60"
              >
                {alias}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* External links are now handled by the ExternalLinks component in PersonDetail */}
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

'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useRouter, usePathname} from '@/i18n/navigation';

const LOCALES = [
  {code: 'en', label: 'EN', flag: '🇺🇸'},
  {code: 'th', label: 'TH', flag: '🇹🇭'},
] as const;

export default function LanguageSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, {locale: newLocale});
  };

  return (
    <div className="flex items-center gap-1 bg-surface rounded-lg p-1 border border-border">
      {LOCALES.map(({code, label, flag}) => (
        <button
          key={code}
          onClick={() => handleLocaleChange(code)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            locale === code
              ? 'bg-primary text-white'
              : 'text-foreground/60 hover:text-white hover:bg-surface-hover'
          }`}
          aria-label={t('label')}
          title={code === 'en' ? 'English' : 'Thai'}
        >
          <span className="mr-1">{flag}</span>
          {label}
        </button>
      ))}
    </div>
  );
}

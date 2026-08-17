'use client';

import {useTranslations} from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* App Info */}
          <div className="text-center md:text-left">
            <p className="text-sm text-foreground/60">{t('appDescription')}</p>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-sm text-foreground/60">
              &copy; {currentYear} Movie Series Tracker. {t('copyright')}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

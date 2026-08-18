'use client';

import {useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import {useSession} from 'next-auth/react';

const TABS = [
  {key: 'home' as const, href: '/', icon: 'home'},
  {key: 'movies' as const, href: '/movies', icon: 'film'},
  {key: 'tvSeries' as const, href: '/tv-series', icon: 'tv'},
  {key: 'library' as const, href: '/library', icon: 'library'},
  {key: 'profile' as const, href: '/profile', icon: 'profile'},
] as const;

function TabIcon({icon, isActive}: {icon: string; isActive: boolean}) {
  const cls = `w-5 h-5 ${isActive ? 'text-primary' : 'text-foreground/50'}`;
  switch (icon) {
    case 'home':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
        </svg>
      );
    case 'film':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      );
    case 'tv':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case 'library':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    case 'profile':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function BottomNav() {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const {data: session} = useSession();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {TABS.map(({key, href, icon}) => {
          const active = isActive(href);
          const needsAuth = (key === 'library' || key === 'profile') && !session?.user;
          const targetHref = needsAuth ? '/login' : href;

          return (
            <Link
              key={key}
              href={targetHref}
              className="flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors"
            >
              <TabIcon icon={icon} isActive={active} />
              <span className={`text-[10px] font-medium ${active ? 'text-primary' : 'text-foreground/50'}`}>
                {t(key)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

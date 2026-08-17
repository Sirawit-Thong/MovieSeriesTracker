'use client';

import {useState, useRef, useEffect} from 'react';
import {useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import {useSession, signOut} from 'next-auth/react';
import LanguageSwitcher from './LanguageSwitcher';

const NAV_LINKS = [
  {key: 'movies' as const, href: '/movies'},
  {key: 'tvSeries' as const, href: '/tv-series'},
  {key: 'people' as const, href: '/people'},
];

const AUTH_NAV_LINKS = [
  {key: 'library' as const, href: '/library'},
];

const isAdmin = (session: ReturnType<typeof useSession>['data']) => {
  const role = (session?.user as Record<string, unknown> | undefined)?.role;
  return role === 'ADMIN';
};

export default function Header() {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const {data: session} = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / App Name */}
        <Link
          href="/"
          className="text-xl font-bold text-white hover:text-primary transition-colors"
        >
          <span className="text-primary">M</span>ST
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({key, href}) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={key}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-foreground/70 hover:text-white hover:bg-surface-hover'
                }`}
              >
                {t(key)}
              </Link>
            );
          })}
          {isAdmin(session) && (
            <Link
              href="/admin"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/admin' || pathname.startsWith('/admin/')
                  ? 'bg-primary text-white'
                  : 'text-foreground/70 hover:text-white hover:bg-surface-hover'
              }`}
            >
              Admin
            </Link>
          )}
          {session?.user && AUTH_NAV_LINKS.map(({key, href}) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={key}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-foreground/70 hover:text-white hover:bg-surface-hover'
                }`}
              >
                {t(key)}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          {session?.user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                  text-foreground/70 hover:text-white hover:bg-surface-hover transition-colors"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {(session.user.name ?? session.user.email ?? '?')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="max-w-[100px] truncate">
                  {session.user.name ?? session.user.email}
                </span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-surface border border-border rounded-lg shadow-xl overflow-hidden z-50">
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground/70 hover:text-white hover:bg-surface-hover transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      signOut({callbackUrl: '/'});
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground/70 hover:text-white hover:bg-surface-hover transition-colors border-t border-border"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-1.5 text-sm font-medium text-foreground/70 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-foreground/70 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <nav className="flex flex-col p-4 gap-1">
            {NAV_LINKS.map(({key, href}) => {
              const isActive =
                pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={key}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-foreground/70 hover:text-white hover:bg-surface-hover'
                  }`}
                >
                  {t(key)}
                </Link>
              );
            })}
            {isAdmin(session) && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/admin' || pathname.startsWith('/admin/')
                    ? 'bg-primary text-white'
                    : 'text-foreground/70 hover:text-white hover:bg-surface-hover'
                }`}
              >
                Admin
              </Link>
            )}
            {session?.user && AUTH_NAV_LINKS.map(({key, href}) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={key}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-foreground/70 hover:text-white hover:bg-surface-hover'
                  }`}
                >
                  {t(key)}
                </Link>
              );
            })}
            <div className="mt-2 pt-2 border-t border-border">
              <LanguageSwitcher />
              {session?.user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-sm font-medium text-foreground/70 hover:text-white hover:bg-surface-hover transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({callbackUrl: '/'});
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-foreground/70 hover:text-white hover:bg-surface-hover transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-sm font-medium text-foreground/70 hover:text-white hover:bg-surface-hover transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-hover transition-colors"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

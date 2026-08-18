import type {Metadata, Viewport} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from '@/i18n/routing';
import {notFound} from 'next/navigation';
import '../globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import SessionProvider from '@/components/providers/SessionProvider';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
  viewportFit: 'cover',
};

export async function generateMetadata(
  props: Omit<LayoutProps<'/[locale]'>, 'children'>
): Promise<Metadata> {
  const {locale} = await props.params;

  const titles: Record<string, string> = {
    en: 'Movie Series Tracker',
    th: 'ติดตามภาพยนตร์และซีรีส์',
  };

  const descriptions: Record<string, string> = {
    en: 'Track your favorite movies and TV series. Rate, annotate, and organize your watchlist.',
    th: 'ติดตามภาพยนตร์และซีรีส์ที่คุณชื่นชอบ ให้คะแนน จดบันทึก และจัดระเบียบรายการที่ต้องการดู',
  };

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'MST',
    },
    formatDetection: {
      telephone: false,
    },
    icons: {
      icon: '/icons/icon-192x192.svg',
      apple: '/icons/icon-512x512.svg',
    },
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      type: 'website',
      locale: locale === 'th' ? 'th_TH' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <head>
        {/* CDN for poster/backdrop images */}
        <link rel="preconnect" href="https://image.tmdb.org" />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
            <Header />
            <main className="flex-1 pt-14 md:pt-16 pb-14 md:pb-0">{children}</main>
            <Footer />
            <BottomNav />
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

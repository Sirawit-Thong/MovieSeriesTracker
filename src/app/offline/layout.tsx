import type {Metadata, Viewport} from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Movie Series Tracker',
  description: 'You are offline.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
  viewportFit: 'cover',
};

export default function OfflineLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
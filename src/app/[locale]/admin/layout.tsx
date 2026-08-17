import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth/config';

// Server-side admin gate — any page under /admin renders through here first
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const role = (session?.user as Record<string, unknown> | undefined)?.role;

  if (!session?.user || role !== 'ADMIN') {
    redirect('/');
  }

  return <>{children}</>;
}

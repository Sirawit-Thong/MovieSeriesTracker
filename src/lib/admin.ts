import {auth} from '@/lib/auth/config';
import {NextResponse} from 'next/server';

type SessionUser = {id: string; name?: string | null; email?: string | null; role?: string};

/**
 * Check that the current session has ADMIN role.
 * Returns the session user if authorized, or sends a 403 response and returns null.
 */
export async function requireAdmin(): Promise<{user: SessionUser; response?: never} | {user?: never; response: NextResponse}> {
  const session = await auth();

  if (!session?.user || (session.user as SessionUser).role !== 'ADMIN') {
    return {response: NextResponse.json({error: 'Forbidden'}, {status: 403})};
  }

  return {user: session.user as SessionUser};
}

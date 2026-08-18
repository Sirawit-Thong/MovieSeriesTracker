import {auth} from '@/lib/auth/config';
import {NextResponse} from 'next/server';

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string;
  banned?: boolean;
};

/**
 * Check that the current session has ADMIN role.
 * Returns the session user if authorized, or sends a 403 response and returns null.
 */
export async function requireAdmin(): Promise<{user: SessionUser; response?: never} | {user?: never; response: NextResponse}> {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;

  if (!user || user.role !== 'ADMIN' || user.banned === true) {
    return {response: NextResponse.json({error: 'Forbidden'}, {status: 403})};
  }

  return {user};
}

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import {PrismaAdapter} from '@auth/prisma-adapter';
import prisma from '../db';
import {verifyPassword} from './password';

const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

providers.push(
  Credentials({
    name: 'credentials',
    credentials: {
      email: {label: 'Email', type: 'email'},
      password: {label: 'Password', type: 'password'},
    },
    async authorize(credentials, request) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: {email: credentials.email as string},
      });

      if (!user || !user.passwordHash) {
        await recordLogin({
          userId: user?.id ?? null,
          email: (credentials.email as string) ?? '',
          name: user?.name ?? null,
          method: 'credentials',
          request,
          success: false,
          reason: !user ? 'User not found' : 'No password set',
        });
        return null;
      }

      const isValid = await verifyPassword(
        credentials.password as string,
        user.passwordHash,
      );

      if (!isValid) {
        await recordLogin({
          userId: user.id,
          email: user.email,
          name: user.name,
          method: 'credentials',
          request,
          success: false,
          reason: 'Invalid password',
        });
        return null;
      }

      await recordLogin({
        userId: user.id,
        email: user.email,
        name: user.name,
        method: 'credentials',
        request,
        success: true,
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      };
    },
  })
);

async function recordLogin(opts: {
  userId: string | null;
  email: string;
  name: string | null;
  method: string;
  request?: Request;
  success: boolean;
  reason?: string;
}) {
  try {
    const ip = opts.request?.headers?.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? opts.request?.headers?.get('x-real-ip')
      ?? null;
    const userAgent = opts.request?.headers?.get('user-agent') ?? null;

    await prisma.loginLog.create({
      data: {
        userId: opts.userId || null,
        email: opts.email,
        name: opts.name,
        method: opts.method,
        ip,
        userAgent,
        success: opts.success,
        reason: opts.reason ?? null,
      },
    });
  } catch (error) {
    console.error('[auth:login-log]', error);
  }
}

export const {handlers, auth, signIn, signOut} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {strategy: 'jwt'},
  pages: {
    signIn: '/en/login',
  },
  providers,
  callbacks: {
    async jwt({token, user, account}) {
      if (user) {
        token.id = user.id;
        token.role = (user as Record<string, unknown>).role ?? 'USER';
        if (account?.provider !== 'credentials') {
          const u = user as {id: string; email?: string | null; name?: string | null};
          await recordLogin({
            userId: u.id,
            email: u.email ?? '',
            name: u.name ?? null,
            method: account?.provider ?? 'oauth',
            request: undefined,
            success: true,
          });
        }
      } else if (token?.id) {
        const dbUser = await prisma.user.findUnique({
          where: {id: token.id as string},
          select: {role: true, banned: true},
        });
        if (dbUser) {
          token.role = dbUser.role;
          (token as Record<string, unknown>).banned = dbUser.banned;
        }
      }
      return token;
    },
    async session({session, token}) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      if (token?.role) {
        (session.user as unknown as Record<string, unknown>).role = token.role as string;
      }
      (session.user as unknown as Record<string, unknown>).banned = (token as Record<string, unknown>).banned ?? false;
      return session;
    },
  },
});

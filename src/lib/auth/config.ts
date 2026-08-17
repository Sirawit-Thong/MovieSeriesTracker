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
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: {email: credentials.email as string},
      });

      if (!user || !user.passwordHash) {
        return null;
      }

      const isValid = await verifyPassword(
        credentials.password as string,
        user.passwordHash,
      );

      if (!isValid) {
        return null;
      }

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

export const {handlers, auth, signIn, signOut} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {strategy: 'jwt'},
  pages: {
    signIn: '/en/login',
  },
  providers,
  callbacks: {
    async jwt({token, user}) {
      if (user) {
        token.id = user.id;
        token.role = (user as Record<string, unknown>).role ?? 'USER';
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
      return session;
    },
  },
});

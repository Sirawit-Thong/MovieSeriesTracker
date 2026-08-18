import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {auth} from './lib/auth/config';

const intlMiddleware = createMiddleware(routing);

const rateLimitMap = new Map<string, {count: number; resetAt: number}>();

const RATE_LIMITS: Record<string, {max: number; windowMs: number}> = {
  '/api/auth/register': {max: 5, windowMs: 60 * 1000},
  '/api/auth/password': {max: 5, windowMs: 60 * 1000},
  '/api/search': {max: 30, windowMs: 60 * 1000},
  '/api/admin': {max: 60, windowMs: 60 * 1000},
};

const DEFAULT_RATE_LIMIT = {max: 60, windowMs: 60 * 1000};

function getRateLimitConfig(pathname: string) {
  for (const [path, config] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(path)) return config;
  }
  return DEFAULT_RATE_LIMIT;
}

function applyRateLimit(request: NextRequest): NextResponse | null {
  const {pathname} = request.nextUrl;

  if (!pathname.startsWith('/api')) return null;

  const ip = request.headers.get('x-forwarded-for')?.split(',').pop()?.trim() || 'anonymous';
  const key = `${ip}:${pathname}`;
  const config = getRateLimitConfig(pathname);
  const now = Date.now();

  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, {count: 1, resetAt: now + config.windowMs});
    return null;
  }

  if (entry.count >= config.max) {
    return NextResponse.json(
      {error: 'Too many requests. Please try again later.'},
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)),
          'X-RateLimit-Limit': String(config.max),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
        },
      }
    );
  }

  entry.count++;
  return null;
}

export const middleware = auth((request) => {
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  if (request.nextUrl.pathname.startsWith('/api')) return NextResponse.next();

  const user = request.auth?.user as
    | (Record<string, unknown> & {banned?: boolean})
    | undefined;
  if (user?.banned) {
    const locale = request.nextUrl.pathname.startsWith('/th') ? 'th' : 'en';
    return NextResponse.redirect(new URL(`/${locale}/login?error=banned`, request.nextUrl));
  }

  return intlMiddleware(request);
});

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/api/:path*',
  ],
  runtime: 'nodejs',
};

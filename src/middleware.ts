import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export default function middleware(request: NextRequest) {
  // Set x-url header on the request so server components can detect admin routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', request.nextUrl.pathname);

  const response = intlMiddleware(request);

  // If intl middleware returns a redirect, return it as-is
  if (response.headers.get('location')) {
    return response;
  }

  // Pass through and let the page component read x-url from headers()
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};

import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

const PROTECTED_PAGES = ['/admin', '/design-system'];
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isLoggedIn = !!request.auth;

  // Halaman login: kalau sudah login langsung ke dashboard
  if (pathname === '/admin/login') {
    if (isLoggedIn) return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  } else if (PROTECTED_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    // Halaman CMS & design system wajib login
    if (!isLoggedIn) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // API yang mengubah data (POST/PUT/PATCH/DELETE) wajib login.
  // Endpoint internal Auth.js dikecualikan, kecuali /api/auth/register.
  const isAuthJsRoute = pathname.startsWith('/api/auth/') && pathname !== '/api/auth/register';
  if (pathname.startsWith('/api/') && !isAuthJsRoute && !SAFE_METHODS.includes(request.method) && !isLoggedIn) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Cache headers
  if (pathname.startsWith('/img/') || pathname.startsWith('/lottie/') || pathname.startsWith('/_next/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (pathname.startsWith('/api/auth')) {
    response.headers.set('Cache-Control', 'no-store');
  } else if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  } else if (pathname === '/' || pathname.startsWith('/profile') || pathname.startsWith('/curiculum')) {
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  }

  return response;
});

export const config = {
  matcher: ['/((?!_next/webpack-hmr|_next/static|_next/image|favicon.ico).*)'],
};

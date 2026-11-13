import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const pathname = request.nextUrl.pathname;

  // Auth.js: area /admin (kecuali /admin/login) butuh sesi
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !request.auth) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Add cache headers for static assets
  
  if (pathname.startsWith('/img/') || pathname.startsWith('/_next/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/layanan') || pathname.startsWith('/api/warta')) {
    // auth & pengajuan layanan bersifat pribadi — jangan pernah di-cache
    response.headers.set('Cache-Control', 'no-store');
  } else if (pathname.startsWith('/api/')) {
    // Cache API responses for 1 hour
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  } else if (pathname === '/' || pathname.startsWith('/profile') || pathname.startsWith('/curiculum')) {
    // Cache pages for 1 hour
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  }

  return response;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/webpack-hmr (hot-module-reload)
     * - api (API routes are handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/webpack-hmr|_next/static|_next/image|favicon.ico).*)',
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that must always be accessible without authentication
  if (
    pathname === '/register' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname === '/firebase-messaging-sw.js' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if guardian auth cookie exists
  const authCookie = request.cookies.get('koru_auth');
  
  if (!authCookie || authCookie.value !== 'true') {
    const registerUrl = request.nextUrl.clone();
    registerUrl.pathname = '/register';
    // Optionally preserve the intended destination in redirect query
    if (pathname !== '/') {
      registerUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(registerUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

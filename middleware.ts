import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip authentication for API routes and static files
  if (
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const isAuthenticated = request.cookies.get('app-authenticated')?.value === 'true';
  
  // If accessing login page
  if (request.nextUrl.pathname === '/login') {
    // If already authenticated, redirect to home
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // Allow access to login page
    return NextResponse.next();
  }

  // If not authenticated and trying to access protected routes, redirect to login
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
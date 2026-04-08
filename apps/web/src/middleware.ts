// apps/web/src/middleware.ts
/**
 * Route Protection Middleware — cookie-based auth guard.
 *
 * Logic:
 * 1. Public routes: /login, /verificar-2fa (and sub-paths) — always allow
 * 2. Protected routes: require gt-auth cookie
 * 3. No cookie on protected route → redirect to /login?redirect={originalPath}
 * 4. Has cookie on /login → redirect to /dashboard
 * 5. Open-redirect prevention: validate redirect is internal (starts with /, no ://)
 *
 * NOTE: middleware.ts runs at the edge BEFORE the page renders.
 * It only checks cookie EXISTENCE, not the token value itself.
 * Token validation is done by the API client.
 *
 * Auth flow:
 * - Backend (localhost:3001) sets httpOnly 'refreshToken' cookie for API auth
 * - Client (localhost:3000) sets 'gt-auth' cookie for middleware route protection
 * - These are different cookies because middleware can't read httpOnly cross-origin cookies
 */

import { NextResponse, type NextRequest } from 'next/server';

// ============================================================================
// Cookie name — client-side cookie set by login for middleware detection
// The backend sets httpOnly 'refreshToken' cookie for API auth
// This 'gt-auth' cookie is set by the client for middleware route protection
// ============================================================================

const AUTH_COOKIE = 'gt-auth';

// ============================================================================
// Public routes (no auth required)
// ============================================================================

function isPublicRoute(pathname: string): boolean {
  const publicRoutes = ['/login', '/verificar-2fa'];
  return publicRoutes.some((route) => pathname.startsWith(route));
}

// ============================================================================
// Redirect sanitization (open-redirect prevention)
// ============================================================================

function sanitizeRedirect(redirect: string | null): string {
  // No redirect → default to dashboard
  if (!redirect) return '/dashboard';

  // Root path → dashboard (user came from home page)
  if (redirect === '/') return '/dashboard';

  // Must start with / (same-origin only)
  if (!redirect.startsWith('/')) return '/dashboard';

  // Must not contain :// (no protocol — prevents https://, ftp://, etc.)
  if (redirect.includes('://')) return '/dashboard';

  // Must not start with // (protocol-relative URL)
  if (redirect.startsWith('//')) return '/dashboard';

  return redirect;
}

// ============================================================================
// Middleware handler
// ============================================================================

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Check for auth cookie
  const isAuthenticated = request.cookies.has(AUTH_COOKIE);

  // -------------------------------------------------------------------
  // Case 1: Public route
  // -------------------------------------------------------------------
  if (isPublicRoute(pathname)) {
    // If authenticated (has cookie) and trying to access public route
    if (isAuthenticated) {
      const redirectTo = request.nextUrl.searchParams.get('redirect');
      const safeRedirect = sanitizeRedirect(redirectTo);
      return NextResponse.redirect(new URL(safeRedirect, request.url));
    }

    // Unauthenticated on public route — allow
    return NextResponse.next();
  }

  // -------------------------------------------------------------------
  // Case 2: Protected route — no cookie
  // -------------------------------------------------------------------
  if (!isAuthenticated) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // -------------------------------------------------------------------
  // Case 3: Protected route — has cookie → allow
  // -------------------------------------------------------------------
  return NextResponse.next();
}

// ============================================================================
// Matcher — exclude Next.js internals and static assets
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/* (Next.js internals)
     * - api/* (API routes — let them handle auth differently)
     * - static/*, favicon.ico, etc. (static assets)
     */
    '/((?!_next/|api/|static/|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Explicitly allow routes with route groups: /dashboard, /animales, etc.
    '/(dashboard|login|verificar-2fa)/:path*',
  ],
};

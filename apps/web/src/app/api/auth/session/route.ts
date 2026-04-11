// apps/web/src/app/api/auth/session/route.ts
/**
 * Auth session cookie manager — Next.js API route.
 *
 * Why this exists:
 * Browsers block Set-Cookie headers from cross-origin fetch responses
 * (e.g., backend at localhost:3001 setting cookies for a page at localhost:3000).
 * This route runs server-side on localhost:3000, so cookies it sets are
 * same-origin and always accepted by the browser.
 *
 * POST  — store refreshToken as httpOnly cookie after login
 * DELETE — clear refreshToken cookie on logout
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'refreshToken';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { refreshToken } = (await request.json()) as { refreshToken?: string };

  if (!refreshToken) {
    return NextResponse.json({ success: false, error: 'Missing refreshToken' }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });

  return response;
}

export async function DELETE(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}

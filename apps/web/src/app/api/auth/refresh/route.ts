// apps/web/src/app/api/auth/refresh/route.ts
/**
 * Token refresh proxy — Next.js API route.
 *
 * Why this exists:
 * The refreshToken cookie is stored for localhost:3000 (set by /api/auth/session).
 * This server-side route reads that cookie and forwards the refresh request to
 * the backend at NEXT_PUBLIC_API_URL. The browser never talks to the backend
 * directly for the refresh flow.
 *
 * Flow:
 *   Browser → POST /api/auth/refresh (localhost:3000)
 *           → reads refreshToken cookie (same-origin, always accessible)
 *           → POST BACKEND/api/v1/auth/refresh (server-to-server, no CORS)
 *           → 200: rotates cookie, returns { success, data: { accessToken, expiresIn } }
 *           → 401: clears cookie, returns 401
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'refreshToken';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(COOKIE_NAME)?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { success: false, error: 'SESSION_EXPIRED' },
      { status: 401 },
    );
  }

  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`;

  let backendResponse: Response;
  try {
    // Send the refreshToken in the request body (server-to-server).
    // Using Cookie header for server-to-server calls can be unreliable due to
    // how Fastify parses cookies. The backend refresh endpoint accepts the token
    // from either cookies OR the request body (same pattern as logout).
    backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'BACKEND_UNREACHABLE' },
      { status: 503 },
    );
  }

  if (!backendResponse.ok) {
    // Refresh rejected by backend — clear the stale cookie
    const response = NextResponse.json(
      { success: false, error: 'REFRESH_FAILED' },
      { status: 401 },
    );
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  const data = (await backendResponse.json()) as {
    success: boolean;
    data: { accessToken: string; expiresIn: number };
  };

  // Rotate the refreshToken cookie if the backend issued a new one
  const setCookieHeader = backendResponse.headers.get('set-cookie');
  const response = NextResponse.json(data);

  if (setCookieHeader) {
    const match = setCookieHeader.match(/refreshToken=([^;]+)/);
    if (match?.[1]) {
      response.cookies.set(COOKIE_NAME, match[1], {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: COOKIE_MAX_AGE,
      });
    }
  }

  return response;
}

// apps/web/src/shared/lib/api-client.ts
/**
 * API Client — configured ky instance with interceptors.
 *
 * Features:
 * - Request interceptor: attaches Bearer token, X-Predio-Id, Accept-Language
 * - Response error interceptor: 401 → refresh token → retry original request
 * - Refresh queue: shared promise pattern for parallel 401s
 * - Error normalization: non-2xx → ApiError
 *
 * Auth endpoints (/auth/login, /auth/2fa/*, /auth/refresh) are EXCLUDED from
 * the 401 refresh logic — they legitimately return 401 for invalid credentials.
 */

import ky, { type KyInstance, type BeforeRequestHook, type AfterResponseHook } from 'ky';
import { useAuthStore } from '@/store/auth.store';
import { usePredioStore } from '@/store/predio.store';
import { ApiError, normalizeApiError } from './errors';

// ============================================================================
// Configuration
// ============================================================================

const AUTH_ENDPOINTS = ['/auth/login', '/auth/2fa', '/auth/refresh', '/auth/logout'];

function isAuthEndpoint(url: string): boolean {
  return AUTH_ENDPOINTS.some((ep) => url.includes(ep));
}

// ============================================================================
// Refresh Queue (Shared Promise Pattern)
// ============================================================================

let refreshPromise: Promise<string> | null = null;

/**
 * Get or create the shared refresh promise.
 * This ensures only ONE refresh call happens for parallel 401 responses.
 */
async function getOrCreateRefreshPromise(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = executeRefresh().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

/**
 * Execute the token refresh call.
 * Returns the new access token.
 * Throws on refresh failure.
 */
async function executeRefresh(): Promise<string> {
  const authStore = useAuthStore.getState();

  // If we're already in a loading state for auth, wait a bit
  // This shouldn't happen in normal flow but acts as safety
  if (authStore.isLoading) {
    throw new ApiError(401, 'AUTH_IN_PROGRESS', 'Autenticación en progreso');
  }

  try {
    // Call the Next.js proxy route (same-origin) instead of the backend directly.
    // The proxy reads the refreshToken from an httpOnly cookie stored for localhost:3000
    // and forwards it server-to-server to the backend (no CORS restrictions).
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      // Refresh failed — clear auth and redirect to login
      authStore.clearAuth();
      throw new ApiError(response.status, 'REFRESH_FAILED', 'Sesión expirada');
    }

    // Proxy returns same shape as backend: { success: true, data: { accessToken, expiresIn } }
    const wrapped = (await response.json()) as {
      success: boolean;
      data: { accessToken: string; expiresIn: number };
    };
    const { accessToken } = wrapped.data;

    // Update auth store with new token
    authStore.setAuth({
      accessToken,
      user: authStore.user!,
      permissions: authStore.permissions,
    });

    return accessToken;
  } catch (error) {
    // If refresh fails, clear auth and throw
    authStore.clearAuth();

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(401, 'REFRESH_FAILED', 'No se pudo refresh token');
  }
}

// ============================================================================
// Request Interceptor
// ============================================================================

const attachAuthHeaders: BeforeRequestHook = (request) => {
  const authStore = useAuthStore.getState();
  const predioStore = usePredioStore.getState();

  // Attach Bearer token if available
  if (authStore.accessToken) {
    request.headers.set('Authorization', `Bearer ${authStore.accessToken}`);
  }

  // Attach X-Predio-Id if active predio is set
  if (predioStore.predioActivo?.id) {
    request.headers.set('X-Predio-Id', predioStore.predioActivo.id);
  }

  // Hardcode locale
  request.headers.set('Accept-Language', 'es');
};

// ============================================================================
// Response Error Interceptor
// ============================================================================

const handleResponseErrors: AfterResponseHook = async (
  request,
  _options,
  response,
) => {
  // 2xx — pass through
  if (response.ok) {
    return response;
  }

  // Get URL for auth endpoint check
  const url = request.url;

  // Parse response body
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  // Auth endpoints — don't refresh, just throw normalized error
  if (isAuthEndpoint(url)) {
    const normalized = normalizeApiError(response, body);
    throw new ApiError(response.status, normalized.code, normalized.message);
  }

  // 401 on non-auth endpoint — attempt token refresh + retry
  if (response.status === 401) {
    try {
      const newToken = await getOrCreateRefreshPromise();

      // Retry original request with new token
      const retryRequest = new Request(request, { credentials: 'include' });
      retryRequest.headers.set('Authorization', `Bearer ${newToken}`);

      const retryResponse = await fetch(retryRequest);

      if (retryResponse.ok) {
        return retryResponse;
      }

      // Retry failed — parse error and throw
      let retryBody: unknown;
      try {
        retryBody = await retryResponse.json();
      } catch {
        retryBody = null;
      }

      const normalized = normalizeApiError(retryResponse, retryBody);
      throw new ApiError(retryResponse.status, normalized.code, normalized.message);
    } catch (error) {
      // Refresh failed or retry failed — clear auth and redirect to login
      if (error instanceof ApiError && error.code === 'REFRESH_FAILED') {
        // Clear the client-side gt-auth cookie so the middleware doesn't
        // redirect back to /dashboard after the navigation to /login
        if (typeof document !== 'undefined') {
          document.cookie = 'gt-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      throw error;
    }
  }

  // Other non-2xx — normalize and throw
  const normalized = normalizeApiError(response, body);
  throw new ApiError(response.status, normalized.code, normalized.message, normalized.details);
};

// ============================================================================
// API Client Instance
// ============================================================================

/**
 * Configured ky instance for API calls.
 * Base URL: NEXT_PUBLIC_API_URL/api/v1
 * Timeout: 30 seconds
 * Retry: disabled (token refresh handles 401 manually)
 */
export const apiClient: KyInstance = ky.create({
  prefixUrl: `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1`,
  timeout: 30000,
  retry: 0,
  hooks: {
    beforeRequest: [attachAuthHeaders],
    afterResponse: [handleResponseErrors],
  },
});

// Re-export for convenience
export { ApiError };

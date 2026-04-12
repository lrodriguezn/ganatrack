// apps/web/src/shared/providers/auth-provider.tsx
/**
 * AuthProvider — rehydrates auth state on page refresh.
 *
 * Problem solved: When an authenticated user refreshes the page, the in-memory
 * Zustand auth store is empty. The middleware allows the page to render because
 * the refreshToken cookie exists server-side, but the client-side store is empty.
 *
 * Solution: On mount, call authService.getMe() to:
 * 1. Trigger the api-client refresh interceptor (POST /auth/refresh via httpOnly cookie)
 * 2. Get a fresh accessToken stored in the Zustand auth store
 * 3. Fetch user data and restore permissions from sessionStorage
 * 4. Reload the predio list and restore the previously active predio
 *
 * This flow runs in BOTH production and mock modes.
 * In mock mode only: if getMe() returns 401, fall back to auto-login as admin.
 * In production: if refresh fails, the api-client interceptor redirects to /login.
 */

'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/modules/auth/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { usePredioStore } from '@/store/predio.store';
import { ApiError } from '@/shared/lib/errors';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider component.
 * On mount, attempts to rehydrate auth state by calling getMe().
 * While rehydrating, shows a loading spinner.
 * On 401, clears auth and redirects to login.
 */
export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const rehydrateAuth = async (): Promise<void> => {
      // Skip rehydration if already on login page (no session to restore)
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/login')) {
        setIsHydrating(false);
        return;
      }

      // Skip rehydration if user is already authenticated (e.g., just logged in)
      // This prevents the AuthProvider from clearing auth state after a client-side navigation
      const currentState = useAuthStore.getState();
      if (currentState.accessToken && currentState.user) {
        setIsHydrating(false);
        return;
      }

      const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
      // Flag: keep spinner if we're navigating away (refresh failed → redirect to /login)
      let navigatingAway = false;

      try {
        // Step 1: Call getMe() — the api-client interceptor handles the 401→refresh cycle:
        //   a) GET /auth/me is sent with no Bearer token (store is empty after refresh)
        //   b) API returns 401
        //   c) Interceptor calls POST /api/auth/refresh (Next.js proxy)
        //   d) Proxy reads refreshToken cookie and forwards to backend
        //   e) Gets a fresh accessToken, stores it in the Zustand auth store
        //   f) Retries GET /auth/me with the new token → 200 confirms session is valid
        await authService.getMe();

        // Step 2: Read the fresh accessToken set by the interceptor during Step 1
        const { accessToken } = useAuthStore.getState();

        // Step 3: Restore user from sessionStorage (GET /me only validates session;
        // full user data — nombre, email, rol — was saved to sessionStorage at login)
        let storedUser = null;
        try {
          const stored = sessionStorage.getItem('ganatrack-auth-user');
          storedUser = stored ? JSON.parse(stored) : null;
        } catch {
          sessionStorage.removeItem('ganatrack-auth-user');
        }

        if (!storedUser) {
          // No cached user data — session is valid but we can't restore UI state
          // Force a full re-login to rebuild the session properly
          throw new Error('NO_CACHED_USER');
        }

        // Step 4: Restore permissions from sessionStorage
        let storedPermissions: string[] = [];
        try {
          const stored = sessionStorage.getItem('ganatrack-auth-permissions');
          storedPermissions = stored ? JSON.parse(stored) : [];
        } catch {
          sessionStorage.removeItem('ganatrack-auth-permissions');
        }

        // Step 5: Restore the previously active predio from sessionStorage
        let savedPredioId: number | null = null;
        try {
          const storedPredioId = sessionStorage.getItem('ganatrack-predio-activo-id');
          savedPredioId = storedPredioId ? Number(storedPredioId) : null;
        } catch { /* ignore */ }

        // Step 6: Commit the full auth state (accessToken + user + permissions)
        useAuthStore.getState().setAuth({
          accessToken,
          user: storedUser,
          permissions: storedPermissions,
        });

        // Step 6: Load predios and restore the active predio
        try {
          const predios = await authService.getPredios();
          usePredioStore.getState().setPredios(predios);

          if (savedPredioId && predios.some((p) => p.id === savedPredioId)) {
            usePredioStore.getState().switchPredio(savedPredioId);
          }
        } catch {
          // Predios failed — continue without them, user can select manually
        }
      } catch (error) {
        if (useMocks && error instanceof ApiError && error.status === 401) {
          // Mock mode only: no valid session → auto-login as admin for development convenience
          const loginResult = await authService.login({
            email: 'admin@ganatrack.com',
            password: 'Admin123!',
          });

          if (!('requires2FA' in loginResult)) {
            useAuthStore.getState().setAuth({
              accessToken: loginResult.accessToken,
              user: loginResult.user,
              permissions: loginResult.permissions,
            });
            sessionStorage.setItem('ganatrack-auth-permissions', JSON.stringify(loginResult.permissions));

            try {
              const predios = await authService.getPredios();
              usePredioStore.getState().setPredios(predios);
            } catch {
              // Mock predios failed — ignore
            }
          }
        }
        // Production: REFRESH_FAILED → api-client interceptor already redirected to /login.
        // Keep the spinner up so the user doesn't see a flash of empty dashboard.
        if (error instanceof ApiError && error.code === 'REFRESH_FAILED') {
          navigatingAway = true;
        }
      } finally {
        if (!navigatingAway) {
          setIsHydrating(false);
        }
      }
    };

    rehydrateAuth();
  }, []);

  // While rehydrating, show a loading spinner
  // This prevents flash of unauthenticated content
  if (isHydrating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

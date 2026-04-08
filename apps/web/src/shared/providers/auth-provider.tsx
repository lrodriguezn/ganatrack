// apps/web/src/shared/providers/auth-provider.tsx
/**
 * AuthProvider — rehydrates auth state on page refresh.
 *
 * Problem solved: When an authenticated user refreshes the page, the in-memory
 * Zustand auth store is empty. The middleware allows the page to render because
 * the refreshToken cookie exists server-side, but the client-side store is empty.
 *
 * Solution: On mount, call authService.getMe() to:
 * 1. Verify the session is still valid (cookie-based)
 * 2. Rehydrate the user data and permissions in the store
 *
 * NOTE: We cannot rehydrate the accessToken this way because:
 * - getMe() doesn't return a new accessToken
 * - The new token would come from POST /auth/refresh which requires the httpOnly cookie
 * - This is handled automatically by the api-client interceptor on the first API call
 *
 * So after rehydration, the user has:
 * - user + permissions populated (so RBAC works immediately)
 * - accessToken = null (so first API call triggers refresh + retry)
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // Use ref to avoid re-triggering effect on router changes
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    const rehydrateAuth = async (): Promise<void> => {
      // Skip rehydration if already on login page (no session to restore)
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/login')) {
        setIsHydrating(false);
        return;
      }

      // When not using mocks, skip rehydration entirely
      // The auth is already valid after login, and getMe() may fail due to token issues
      // This prevents the dashboard loop
      const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
      if (!useMocks) {
        setIsHydrating(false);
        return;
      }

      try {
        // Attempt to get current user using existing session (cookie)
        const userData = await authService.getMe();

        // Success: store has a valid session
        // Set auth with user data but NO accessToken (it will be refreshed on first API call)
        // We use a placeholder that indicates rehydration happened

        // Restore permissions from sessionStorage (stored during login/2FA success)
        let permissions: string[] = [];
        try {
          const storedPermissions = sessionStorage.getItem('ganatrack-auth-permissions');
          permissions = storedPermissions ? JSON.parse(storedPermissions) : [];
        } catch {
          // Corrupted data — clear and continue with empty permissions
          sessionStorage.removeItem('ganatrack-auth-permissions');
        }

        // Restore active predio ID from sessionStorage
        let savedPredioId: number | null = null;
        try {
          const storedPredioId = sessionStorage.getItem('ganatrack-predio-activo-id');
          savedPredioId = storedPredioId ? Number(storedPredioId) : null;
        } catch { /* ignore */ }

        useAuthStore.getState().setAuth({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          accessToken: '', // Empty string — will trigger 401 on API calls, which triggers refresh
          user: userData,
          permissions,
        });

        // Load predios and restore active selection
        try {
          const predios = await authService.getPredios();
          usePredioStore.getState().setPredios(predios);

          // Restore saved predio if it exists in the list
          if (savedPredioId && predios.some((p) => p.id === savedPredioId)) {
            usePredioStore.getState().switchPredio(savedPredioId);
          }
        } catch {
          // Predios failed to load — continue without them
        }
      } catch (error) {
        // 401 means session expired or invalid
        if (error instanceof ApiError && error.status === 401) {
          // DEV MODE: Auto-login as admin when mocks are enabled and no session exists
          const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
          if (useMocks) {
            // Call mock login to set internal mockLoggedInUser state
            // (required for getMe() and getPredios() to work in mock mode)
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

              // Load predios from mock service
              try {
                const predios = await authService.getPredios();
                usePredioStore.getState().setPredios(predios);

                // Restore saved predio if it exists
                let savedPredioId: number | null = null;
                try {
                  const storedPredioId = sessionStorage.getItem('ganatrack-predio-activo-id');
                  savedPredioId = storedPredioId ? Number(storedPredioId) : null;
                } catch { /* ignore */ }

                if (savedPredioId && predios.some((p) => p.id === savedPredioId)) {
                  usePredioStore.getState().switchPredio(savedPredioId);
                }
              } catch {
                // Mock predios failed — ignore
              }
            }
          } else {
            clearAuth();
            // Clear the mock cookie so middleware doesn't redirect back to dashboard
            document.cookie = 'ganatrack-refresh=; path=/; max-age=0';
            // Redirect to login if not already there
            if (!window.location.pathname.startsWith('/login')) {
              routerRef.current.push('/login');
            }
          }
        }
        // Other errors — ignore, user stays unauthenticated
      } finally {
        setIsHydrating(false);
      }
    };

    rehydrateAuth();
  }, [clearAuth, router]);

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

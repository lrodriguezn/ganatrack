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

      // In production mode (no mocks), skip rehydration entirely
      // The auth state is managed by the login/logout hooks and Zustand persistence
      // The middleware protects routes, and the first API call will handle token refresh
      // NEXT_PUBLIC_MSW_ENABLED covers LHCI CI runs — MSW intercepts getMe() for mock data
      const useMocks =
        process.env.NEXT_PUBLIC_USE_MOCKS === 'true' ||
        process.env.NEXT_PUBLIC_MSW_ENABLED === 'true';
      if (!useMocks) {
        setIsHydrating(false);
        return;
      }

      // Mock mode only: rehydrate with auto-login
      try {
        // Step 1: Call getMe() - this will trigger the refresh interceptor if needed
        const userData = await authService.getMe();

        // Step 2: Now read the fresh accessToken from the store (set by interceptor)
        const { accessToken, permissions } = useAuthStore.getState();

        // Step 3: Restore additional data from sessionStorage
        let storedPermissions = permissions;
        if (!storedPermissions || storedPermissions.length === 0) {
          try {
            const stored = sessionStorage.getItem('ganatrack-auth-permissions');
            storedPermissions = stored ? JSON.parse(stored) : [];
          } catch {
            sessionStorage.removeItem('ganatrack-auth-permissions');
          }
        }

        let savedPredioId: number | null = null;
        try {
          const storedPredioId = sessionStorage.getItem('ganatrack-predio-activo-id');
          savedPredioId = storedPredioId ? Number(storedPredioId) : null;
        } catch { /* ignore */ }

        // Step 4: Update auth store with user data (accessToken already set by interceptor)
        useAuthStore.getState().setAuth({
          accessToken,
          user: userData,
          permissions: storedPermissions,
        });

        // Step 5: Load predios
        try {
          const predios = await authService.getPredios();
          usePredioStore.getState().setPredios(predios);

          if (savedPredioId && predios.some((p) => p.id === savedPredioId)) {
            usePredioStore.getState().switchPredio(savedPredioId);
          }
        } catch {
          // Predios failed - continue without them
        }
      } catch (error) {
        // 401 in mock mode — auto-login as admin
        if (error instanceof ApiError && error.status === 401) {
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
      } finally {
        setIsHydrating(false);
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

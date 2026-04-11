// apps/web/src/modules/auth/hooks/use-logout.ts
/**
 * useLogout — hook for logout orchestration.
 *
 * Responsibilities:
 * - Call authService.logout() (fire and forget)
 * - Clear auth state via authStore.clearAuth()
 * - Clear predios via predioStore.clearPredios()
 * - Redirect to /login
 */

'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { usePredioStore } from '@/store/predio.store';

export interface UseLogoutReturn {
  logout: () => void;
}

export function useLogout(): UseLogoutReturn {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const clearPredios = usePredioStore((s) => s.clearPredios);

  const logout = useCallback(() => {
    // Fire and forget — don't await
    authService.logout().catch(() => {
      // Ignore logout errors — we clear local state regardless
    });

    // Clear the refreshToken httpOnly cookie stored for localhost:3000
    fetch('/api/auth/session', { method: 'DELETE' }).catch(() => {});

    // Clear all local state
    clearAuth();
    clearPredios();

    // Clear the client-side auth cookie for middleware
    document.cookie = 'gt-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    // Redirect to login
    router.push('/login');
  }, [router, clearAuth, clearPredios]);

  return { logout };
}

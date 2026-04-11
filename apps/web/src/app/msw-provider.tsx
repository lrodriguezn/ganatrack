// apps/web/src/app/msw-provider.tsx
/**
 * MSW Provider — conditionally starts the MSW browser worker in CI/LHCI environments.
 *
 * Only active when NEXT_PUBLIC_MSW_ENABLED=true (set only in lighthouse CI jobs).
 * Production builds tree-shake all MSW code when env var is unset.
 */
'use client';

import { useEffect, type ReactNode } from 'react';

const MSW_ENABLED = process.env.NEXT_PUBLIC_MSW_ENABLED === 'true';

export function MswProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!MSW_ENABLED || typeof window === 'undefined') return;

    let cancelled = false;

    void (async () => {
      try {
        const { startMockService, setMockUser } = await import('@/tests/mocks/browser');
        await startMockService();
        if (cancelled) return;
        // Expose setter so the LHCI puppeteer script can re-seed the user per URL
        (window as Window & { __mswSetUser?: typeof setMockUser }).__mswSetUser = setMockUser;
        // Seed default CI admin user
        setMockUser({
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'admin@ganatrack.com',
          nombre: 'Admin Ganatrack',
          rol: 'admin',
        });
      } catch (err) {
        if (!cancelled) console.error('[MswProvider] Failed to initialize MSW:', err);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return <>{children}</>;
}

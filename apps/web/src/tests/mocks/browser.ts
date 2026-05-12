// apps/web/src/tests/mocks/browser.ts
/**
 * MSW browser worker setup for LHCI and local CI testing.
 *
 * Used by MswProvider (src/app/msw-provider.tsx) when NEXT_PUBLIC_MSW_ENABLED=true.
 * NOT used in production builds.
 */
import { setupWorker } from 'msw/browser';
// @ts-ignore — handlers are test-only and not included in production typecheck
import { allHandlers, setMockLoggedInUser } from './handlers';

// @ts-ignore
export const worker = setupWorker(...allHandlers);

export async function startMockService(): Promise<void> {
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: '/mockServiceWorker.js' },
  });
}

export const setMockUser = setMockLoggedInUser;

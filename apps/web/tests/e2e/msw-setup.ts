// apps/web/tests/e2e/msw-setup.ts
/**
 * MSW Setup for Playwright E2E tests.
 *
 * This file initializes MSW service worker for browser mocking in E2E tests.
 * Import this in a setup file or before running tests.
 *
 * Usage in test file:
 *   import './msw-setup'; // Start MSW before tests run
 *
 * Or in playwright config:
 *   setupFiles: ['./tests/e2e/msw-setup.ts']
 */

import { worker } from '../mocks/browser';

export async function startMSW(): Promise<void> {
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  });
}

// Auto-start MSW when this module is imported
startMSW().catch((err) => {
  console.error('[MSW] Failed to start:', err);
});

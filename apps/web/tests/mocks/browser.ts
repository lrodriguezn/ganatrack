// apps/web/tests/mocks/browser.ts
/**
 * MSW browser setup for Playwright.
 */
import { setupWorker } from 'msw/browser';
import { allHandlers } from './handlers';

export const worker = setupWorker(...allHandlers);

export async function startMockService() {
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
  console.log('[MSW] Mock service started');
}

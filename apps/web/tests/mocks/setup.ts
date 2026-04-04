// apps/web/tests/mocks/setup.ts
/**
 * Convenience function for setting up MSW in tests.
 */
import { afterAll, afterEach, beforeAll } from 'vitest';
import { allHandlers } from './handlers';
import { setupServer } from 'msw/node';

export function setupMockServer() {
  const server = setupServer(...allHandlers);

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  return server;
}

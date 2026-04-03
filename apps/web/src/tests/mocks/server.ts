// apps/web/src/tests/mocks/server.ts
/**
 * MSW v2 server setup.
 * Combines all handlers and exports a single server instance.
 */
import { setupServer } from 'msw/node';
import { authHandlers } from './handlers/auth.handlers';
import { prediosHandlers } from './handlers/predios.handlers';

export const server = setupServer(
  ...authHandlers,
  ...prediosHandlers,
);

// apps/web/src/tests/setup.ts
/**
 * Vitest global setup file.
 * - Extends expect with @testing-library/jest-dom matchers
 * - Starts MSW server for API mocking
 */
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Start MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

// Reset handlers after each test to avoid test pollution
afterEach(() => {
  server.resetHandlers();
});

// Close server after all tests
afterAll(() => {
  server.close();
});

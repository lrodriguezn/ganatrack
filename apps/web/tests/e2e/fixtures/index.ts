// apps/web/tests/e2e/fixtures/index.ts
/**
 * Barrel export for all E2E test fixtures.
 *
 * Usage:
 *   import { test, expect } from './fixtures';          // All fixtures
 *   import { test, expect } from './fixtures/auth.fixture'; // Auth fixture only
 */

export { test, expect } from './auth.fixture';
export type { AuthFixtures } from './auth.fixture';

export {
  TEST_2FA_EMAIL,
  TEST_2FA_PASSWORD,
  TEST_2FA_CODE,
  fillLoginForm,
  fill2FACode,
  waitFor2FAForm,
  complete2FALogin,
  getOTPInputs,
  is2FAFormVisible,
  get2FAError,
} from './twofa.fixture';

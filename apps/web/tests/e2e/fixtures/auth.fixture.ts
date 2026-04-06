// apps/web/tests/e2e/fixtures/auth.fixture.ts
/**
 * Auth fixture — provides pre-authenticated page contexts.
 *
 * Uses storageState files created by global-setup.ts to inject
 * authenticated session state without going through login UI.
 *
 * Usage:
 *   import { test, expect } from './fixtures/auth.fixture';
 *
 *   test('my test', async ({ authenticatedPage }) => {
 *     await authenticatedPage.goto('/dashboard/animales');
 *     await expect(authenticatedPage.locator('h1')).toContainText('Animales');
 *   });
 */

import { test as base, type Page } from '@playwright/test';
import * as path from 'path';

// Path to auth storageState files (relative to this file's location)
const AUTH_DIR = path.join(__dirname, '../../.playwright/auth');

/**
 * Fixture types for authenticated test context.
 */
export type AuthFixtures = {
  /**
   * Pre-authenticated page using admin credentials.
   * Use this for most authenticated tests.
   */
  authenticatedPage: Page;

  /**
   * Pre-authenticated page using 2FA user credentials.
   * Use this when testing 2FA-specific flows.
   */
  twoFAPage: Page;
};

/**
 * Extended test fixture with auth helpers.
 */
export const test = base.extend<AuthFixtures>({
  /**
   * Admin authenticated page — storageState from global-setup.
   */
  authenticatedPage: async ({ browser }, use) => {
    const storageStatePath = path.resolve(AUTH_DIR, 'admin.json');

    const context = await browser.newContext({
      storageState: storageStatePath,
    });

    const page = await context.newPage();

    // Ensure page is properly authenticated by checking for auth redirect
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    // If we're on login page after load, auth failed
    const onLoginPage = page.url().includes('/login');
    if (onLoginPage) {
      throw new Error(
        `Auth failed: redirected to /login. ` +
        `Ensure global-setup ran successfully and ${storageStatePath} exists.`,
      );
    }

    await use(page);
    await context.close();
  },

  /**
   * 2FA user authenticated page — storageState from global-setup.
   */
  twoFAPage: async ({ browser }, use) => {
    const storageStatePath = path.resolve(AUTH_DIR, '2fa.json');

    const context = await browser.newContext({
      storageState: storageStatePath,
    });

    const page = await context.newPage();

    // Ensure page is properly authenticated
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const onLoginPage = page.url().includes('/login');
    if (onLoginPage) {
      throw new Error(
        `2FA auth failed: redirected to /login. ` +
        `Ensure global-setup ran successfully and ${storageStatePath} exists.`,
      );
    }

    await use(page);
    await context.close();
  },
});

/**
 * Re-export expect from Playwright for convenience.
 */
export { expect } from '@playwright/test';

// apps/web/tests/e2e/fixtures/twofa.fixture.ts
/**
 * 2FA fixture — helpers for 2FA authentication flow testing.
 *
 * This fixture provides utilities for:
 * - Completing 2FA login flow programmatically
 * - Testing 2FA code validation
 * - Testing 2FA resend functionality
 * - Testing 2FA countdown expiry
 *
 * Usage:
 *   import { test } from './fixtures/twofa.fixture';
 *
 *   test('should show 2FA form after login', async ({ page }) => {
 *     await page.goto('/login');
 *     await fillLoginForm(page, '2fa@ganatrack.com', 'password123');
 *     await expect(page.locator('text=Verificación de dos pasos')).toBeVisible();
 *   });
 */

import { type Page, type Locator } from '@playwright/test';

export const TEST_2FA_EMAIL = '2fa@ganatrack.com';
export const TEST_2FA_PASSWORD = 'password123';
export const TEST_2FA_CODE = '123456';

/**
 * Login helper — fills login form and submits.
 * Does NOT wait for navigation — caller handles 2FA or dashboard redirect.
 */
export async function fillLoginForm(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.getByLabel(/correo/i).fill(email);
  await page.getByLabel(/contraseña/i).fill(password);
  await page.getByRole('button', { name: /ingresar/i }).click();
}

/**
 * 2FA helper — fills 6-digit OTP code.
 * Supports both individual digit inputs and single combined input.
 */
export async function fill2FACode(page: Page, code: string = TEST_2FA_CODE): Promise<void> {
  // Try individual digit inputs first (auto-advancing OTP inputs)
  const otpInputs = page.locator('input[inputmode="numeric"]');
  const count = await otpInputs.count();

  if (count === 6) {
    // Individual digit inputs — fill each one
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill(code[i]);
    }
  } else {
    // Fallback: single input field
    const input = page.locator('input').first();
    await input.fill(code);
  }
}

/**
 * Wait for 2FA form to be visible.
 */
export async function waitFor2FAForm(page: Page): Promise<void> {
  await page.waitForSelector('input[inputmode="numeric"]', { timeout: 5000 });
}

/**
 * Complete full 2FA login flow programmatically.
 * Useful when testing post-2FA redirects or authenticated flows.
 */
export async function complete2FALogin(
  page: Page,
  email: string = TEST_2FA_EMAIL,
  password: string = TEST_2FA_PASSWORD,
  code: string = TEST_2FA_CODE,
): Promise<void> {
  await fillLoginForm(page, email, password);

  // Wait for 2FA form to appear
  await waitFor2FAForm(page);

  // Fill 2FA code
  await fill2FACode(page, code);

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard**', { timeout: 10000 });
}

/**
 * Get all 6 OTP input locators.
 */
export function getOTPInputs(page: Page): Locator {
  return page.locator('input[inputmode="numeric"]');
}

/**
 * Check if 2FA form is currently visible.
 */
export async function is2FAFormVisible(page: Page): Promise<boolean> {
  const inputs = page.locator('input[inputmode="numeric"]');
  return (await inputs.count()) === 6;
}

/**
 * Get the error message from 2FA form if visible.
 */
export async function get2FAError(page: Page): Promise<string | null> {
  const errorLocator = page.locator('[class*="red"]').filter({ hasText: /código|inválido|expirado/i });
  if (await errorLocator.isVisible()) {
    return errorLocator.textContent();
  }
  return null;
}

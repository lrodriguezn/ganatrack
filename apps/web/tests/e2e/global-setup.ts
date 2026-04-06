// apps/web/tests/e2e/global-setup.ts
/**
 * Global setup — runs once before all tests.
 *
 * Responsibilities:
 * 1. Login as admin user via API and save storageState to .playwright/auth/admin.json
 * 2. Login as 2FA user and save storageState to .playwright/auth/2fa.json
 *
 * This ensures all tests have pre-authenticated contexts without
 * needing to go through the login UI each time.
 *
 * Note: This setup requires the API server to be running. The webServer
 * in playwright.config.ts starts the Next.js dev server, but the API
 * must be started separately or the NEXT_PUBLIC_API_URL must point to
 * a running API instance.
 */

import { chromium, type FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { MOCK_2FA_CODE } from './helpers/test-data';

const AUTH_DIR = path.join(__dirname, '../../.playwright/auth');
const ADMIN_EMAIL = 'admin@ganatrack.com';
const ADMIN_PASSWORD = 'password123';
const TWOFA_EMAIL = '2fa@ganatrack.com';

async function globalSetup(config: FullConfig) {
  // Ensure auth directory exists
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  const baseURL = config.projects[0]?.use?.baseURL ?? 'http://localhost:3000';
  const apiURL = process.env.NEXT_PUBLIC_API_URL ?? baseURL;

  const browser = await chromium.launch();

  // ---------------------------------------------------------------------------
  // Admin user — direct login via API
  // ---------------------------------------------------------------------------
  try {
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    // Navigate to login page first to set up the app state
    await adminPage.goto(`${baseURL}/login`);
    await adminPage.waitForLoadState('networkidle');

    // Fill and submit login form
    await adminPage.getByLabel(/correo/i).fill(ADMIN_EMAIL);
    await adminPage.getByLabel(/contraseña/i).fill(ADMIN_PASSWORD);
    await adminPage.getByRole('button', { name: /ingresar/i }).click();

    // Wait for redirect to dashboard
    await adminPage.waitForURL(/\/dashboard/, { timeout: 15000 });
    await adminPage.waitForLoadState('networkidle');

    // Save storage state with cookies and localStorage
    const adminStorageState = path.join(AUTH_DIR, 'admin.json');
    await adminContext.storageState({ path: adminStorageState });
    await adminContext.close();

    console.log('[globalSetup] Admin auth saved to', adminStorageState);
  } catch (error) {
    console.error('[globalSetup] Admin login failed:', error);
    throw error; // Fail fast - don't mask auth failures
  }

  // ---------------------------------------------------------------------------
  // 2FA user — login with 2FA verification
  // ---------------------------------------------------------------------------
  try {
    const twoFAContext = await browser.newContext();
    const twoFAPage = await twoFAContext.newPage();

    // Navigate to login page
    await twoFAPage.goto(`${baseURL}/login`);
    await twoFAPage.waitForLoadState('networkidle');

    // Fill login form with 2FA user
    await twoFAPage.getByLabel(/correo/i).fill(TWOFA_EMAIL);
    await twoFAPage.getByLabel(/contraseña/i).fill(ADMIN_PASSWORD);
    await twoFAPage.getByRole('button', { name: /ingresar/i }).click();

    // Wait for 2FA form (OTP inputs)
    await twoFAPage.waitForSelector('input[inputmode="numeric"]', { timeout: 10000 });

    // Fill 2FA code - individual digit inputs
    const otpInputs = twoFAPage.locator('input[inputmode="numeric"]');
    const count = await otpInputs.count();

    if (count === 6) {
      const digits = MOCK_2FA_CODE.split('');
      await otpInputs.nth(0).fill(digits[0]);
      await otpInputs.nth(1).fill(digits[1]);
      await otpInputs.nth(2).fill(digits[2]);
      await otpInputs.nth(3).fill(digits[3]);
      await otpInputs.nth(4).fill(digits[4]);
      await otpInputs.nth(5).fill(digits[5]);
    } else {
      // Fallback: try to find any text input
      const textInput = twoFAPage.locator('input[type="text"], input:not([type])').first();
      if (await textInput.isVisible()) {
        await textInput.fill('123456');
      }
    }

    // Wait for redirect to dashboard
    await twoFAPage.waitForURL(/\/dashboard/, { timeout: 15000 });
    await twoFAPage.waitForLoadState('networkidle');

    // Save storage state
    const twoFAStorageState = path.join(AUTH_DIR, '2fa.json');
    await twoFAContext.storageState({ path: twoFAStorageState });
    await twoFAContext.close();

    console.log('[globalSetup] 2FA auth saved to', twoFAStorageState);
  } catch (error) {
    console.error('[globalSetup] 2FA login failed:', error);
    throw error; // Fail fast - don't mask auth failures
  }

  await browser.close();
  console.log('[globalSetup] Auth setup complete');
}

export default globalSetup;

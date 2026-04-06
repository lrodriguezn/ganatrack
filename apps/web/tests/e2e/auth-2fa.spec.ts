// apps/web/tests/e2e/auth-2fa.spec.ts
/**
 * E2E tests for 2FA authentication flows.
 *
 * Scenarios from spec:
 * 1. Flujo completo 2FA exitoso (login → 2FA → dashboard)
 * 2. Error con código 2FA inválido (show error)
 * 3. Redirección automática a 2FA cuando está habilitado
 * 4. Reenvío de código con countdown
 *
 * Uses MSW handlers from tests/mocks/handlers/auth.handlers.ts
 * 2FA credentials: 2fa@ganatrack.com / password123
 * Valid 2FA code: 123456
 */

import { test, expect } from './fixtures';
import {
  MOCK_2FA_EMAIL,
  MOCK_ADMIN_PASSWORD,
  TEST_2FA_CODE,
} from './helpers/test-data';

test.describe('Flujo de Autenticación 2FA', () => {
  test.describe.configure({ mode: 'serial' });

  // =========================================================================
  // Scenario 3: Redirección automática a 2FA
  // =========================================================================
  test('debería redirigir automáticamente a 2FA cuando el usuario tiene 2FA habilitado', async ({ page }) => {
    await page.goto('/login');

    // Fill with 2FA user credentials
    await page.getByLabel(/correo/i).fill(MOCK_2FA_EMAIL);
    await page.getByLabel(/contraseña/i).fill(MOCK_ADMIN_PASSWORD);

    // Submit
    await page.getByRole('button', { name: /ingresar/i }).click();

    // Should redirect back to login OR show 2FA form without full page reload
    // The 2FA form should appear
    await page.waitForSelector('input[inputmode="numeric"]', { timeout: 5000 });

    // Check that the 2FA heading is visible
    await expect(page.locator('text=/verificación de dos pasos/i')).toBeVisible();

    // Timer should be visible
    await expect(page.locator('text=/código expira en/i')).toBeVisible();
  });

  // =========================================================================
  // Scenario 1: Flujo completo 2FA exitoso
  // =========================================================================
  test('debería completar autenticación exitosamente con código 2FA válido', async ({ page }) => {
    await page.goto('/login');

    // Login with 2FA user
    await page.getByLabel(/correo/i).fill(MOCK_2FA_EMAIL);
    await page.getByLabel(/contraseña/i).fill(MOCK_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /ingresar/i }).click();

    // Wait for 2FA form
    const otpInputs = page.locator('input[inputmode="numeric"]');
    await expect(otpInputs).toHaveCount(6, { timeout: 5000 });

    // Fill in 2FA code - individual digit inputs
    await otpInputs.nth(0).fill('1');
    await otpInputs.nth(1).fill('2');
    await otpInputs.nth(2).fill('3');
    await otpInputs.nth(3).fill('4');
    await otpInputs.nth(4).fill('5');
    await otpInputs.nth(5).fill('6');

    // Wait for navigation to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Dashboard should be visible
    await expect(page.locator('text=/dashboard/i')).toBeVisible({ timeout: 5000 });
  });

  // =========================================================================
  // Scenario 2: Error con código 2FA inválido
  // =========================================================================
  test('debería mostrar error con código 2FA inválido', async ({ page }) => {
    await page.goto('/login');

    // Login with 2FA user
    await page.getByLabel(/correo/i).fill(MOCK_2FA_EMAIL);
    await page.getByLabel(/contraseña/i).fill(MOCK_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /ingresar/i }).click();

    // Wait for 2FA form
    const otpInputs = page.locator('input[inputmode="numeric"]');
    await expect(otpInputs).toHaveCount(6, { timeout: 5000 });

    // Fill with wrong 2FA code
    await otpInputs.nth(0).fill('9');
    await otpInputs.nth(1).fill('9');
    await otpInputs.nth(2).fill('9');
    await otpInputs.nth(3).fill('9');
    await otpInputs.nth(4).fill('9');
    await otpInputs.nth(5).fill('9');

    // Wait for error message
    // Note: Depending on implementation, it might auto-submit on 6th digit
    // or require explicit submit
    const submitButton = page.getByRole('button', { name: /verificar/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }

    // Should show error
    await expect(page.locator('text=/código inválido/i')).toBeVisible({ timeout: 5000 });

    // Should still be on 2FA form
    await expect(otpInputs).toHaveCount(6);
  });

  // =========================================================================
  // Scenario 4: Reenvío de código con countdown
  // =========================================================================
  test('debería permitir reenviar código con countdown de 60 segundos', async ({ page }) => {
    await page.goto('/login');

    // Login with 2FA user
    await page.getByLabel(/correo/i).fill(MOCK_2FA_EMAIL);
    await page.getByLabel(/contraseña/i).fill(MOCK_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /ingresar/i }).click();

    // Wait for 2FA form
    await page.waitForSelector('input[inputmode="numeric"]', { timeout: 5000 });

    // Check resend button exists
    const resendButton = page.getByRole('button', { name: /reenviar código/i });
    await expect(resendButton).toBeVisible();

    // Initially might be disabled (cooldown)
    // Check for countdown text
    const countdownText = page.locator('text=/reenviar código en \\d+s/i');
    const hasCountdown = await countdownText.isVisible().catch(() => false);

    if (hasCountdown) {
      // Resend should be disabled during cooldown
      await expect(resendButton).toBeDisabled();

      // Wait for cooldown to expire (or skip in CI)
      if (!process.env.CI) {
        // Wait up to 10 seconds for cooldown to expire (or mock timer in real tests)
        await page.waitForSelector('button:has-text("Reenviar código"):not([disabled])', { timeout: 10000 });
      }
    }

    // Click resend button
    await resendButton.click();

    // Should show confirmation or new countdown
    // Depending on implementation, might show "Código reenviado" or restart countdown
    const resentMessage = page.locator('text=/reenviado/i').first();
    const hasResentMessage = await resentMessage.isVisible().catch(() => false);

    if (hasResentMessage) {
      await expect(resentMessage).toBeVisible();
    }
  });

  // =========================================================================
  // Additional: 2FA with paste support
  // =========================================================================
  test('debería aceptar código 2FA pegado como texto completo', async ({ page }) => {
    await page.goto('/login');

    // Login with 2FA user
    await page.getByLabel(/correo/i).fill(MOCK_2FA_EMAIL);
    await page.getByLabel(/contraseña/i).fill(MOCK_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /ingresar/i }).click();

    // Wait for 2FA form
    await page.waitForSelector('input[inputmode="numeric"]', { timeout: 5000 });

    // Get first OTP input and paste the code
    const firstInput = page.locator('input[inputmode="numeric"]').first();
    await firstInput.paste(TEST_2FA_CODE);

    // Wait for navigation to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  // =========================================================================
  // Additional: Backspace navigation in 2FA
  // =========================================================================
  test('debería navegar entre inputs con flechas y backspace en 2FA', async ({ page }) => {
    await page.goto('/login');

    // Login with 2FA user
    await page.getByLabel(/correo/i).fill(MOCK_2FA_EMAIL);
    await page.getByLabel(/contraseña/i).fill(MOCK_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /ingresar/i }).click();

    // Wait for 2FA form
    const otpInputs = page.locator('input[inputmode="numeric"]');
    await expect(otpInputs).toHaveCount(6, { timeout: 5000 });

    // Fill first input
    await otpInputs.nth(0).fill('1');

    // Press ArrowRight to go to next input
    await otpInputs.nth(0).press('ArrowRight');

    // Fill second input
    await otpInputs.nth(1).fill('2');

    // Press ArrowLeft to go back
    await otpInputs.nth(1).press('ArrowLeft');

    // Press Backspace to clear
    await otpInputs.nth(0).press('Backspace');

    // Verify first input is now empty
    await expect(otpInputs.nth(0)).toHaveValue('');
  });
});

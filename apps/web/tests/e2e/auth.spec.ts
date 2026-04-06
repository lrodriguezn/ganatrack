// apps/web/tests/e2e/auth.spec.ts
/**
 * E2E tests for authentication flows.
 *
 * Scenarios from spec:
 * 1. Login exitoso con credenciales válidas (admin direct login)
 * 2. Error con credenciales inválidas (show error message)
 * 3. Logout redirige a login
 * 4. Sesión expirada redirige a login
 *
 * Uses MSW handlers from tests/mocks/handlers/auth.handlers.ts
 * Credentials: admin@ganatrack.com / password123
 */

import { test, expect } from './fixtures';
import {
  MOCK_ADMIN_EMAIL,
  MOCK_ADMIN_PASSWORD,
  MOCK_2FA_EMAIL,
  TEST_2FA_CODE,
} from './helpers/test-data';

test.describe('Flujo de Autenticación', () => {
  test.describe.configure({ mode: 'serial' });

  // =========================================================================
  // Scenario 1: Login exitoso con credenciales válidas
  // =========================================================================
  test('debería iniciar sesión con credenciales válidas', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);

    // Fill login form
    await page.getByLabel(/correo/i).fill(MOCK_ADMIN_EMAIL);
    await page.getByLabel(/contraseña/i).fill(MOCK_ADMIN_PASSWORD);

    // Submit
    await page.getByRole('button', { name: /ingresar/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Dashboard should be visible
    await expect(page.locator('text=/dashboard/i')).toBeVisible({ timeout: 5000 });
  });

  // =========================================================================
  // Scenario 2: Error con credenciales inválidas
  // =========================================================================
  test('debería mostrar error con credenciales inválidas', async ({ page }) => {
    await page.goto('/login');

    // Fill with wrong password
    await page.getByLabel(/correo/i).fill(MOCK_ADMIN_EMAIL);
    await page.getByLabel(/contraseña/i).fill('wrongpassword');

    // Submit
    await page.getByRole('button', { name: /ingresar/i }).click();

    // Should stay on login page
    await expect(page).toHaveURL(/\/login/);

    // Should show error message
    await expect(page.locator('text=/credenciales inválidas/i')).toBeVisible({ timeout: 5000 });

    // Form should still be usable (no disabled state)
    await expect(page.getByLabel(/correo/i)).toBeEnabled();
  });

  // =========================================================================
  // Scenario 3: Logout redirige a login
  // =========================================================================
  test('debería cerrar sesión y redirigir a login', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByLabel(/correo/i).fill(MOCK_ADMIN_EMAIL);
    await page.getByLabel(/contraseña/i).fill(MOCK_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Find and click logout button
    // Look for logout in header/menu
    const logoutButton = page.getByRole('button', { name: /cerrar sesión/i })
      .or(page.getByRole('menuitem', { name: /cerrar sesión/i }))
      .or(page.locator('button[name="logout"]'))
      .or(page.locator('a[href="/login"]'));

    await logoutButton.first().click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });

    // Dashboard should not be accessible (auth state cleared)
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  // =========================================================================
  // Scenario 4: Sesión expirada redirige a login
  // =========================================================================
  test('debería redirigir a login cuando la sesión expira', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/correo/i).fill(MOCK_ADMIN_EMAIL);
    await page.getByLabel(/contraseña/i).fill(MOCK_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Clear localStorage/sessionStorage to simulate expired session
    await page.evaluate(() => {
      window.sessionStorage.clear();
    });

    // Navigate to a protected page - should redirect to login
    await page.goto('/dashboard/animales');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  // =========================================================================
  // Additional: 2FA redirect flow
  // =========================================================================
  test('debería redirigir a verificación 2FA cuando el usuario tiene 2FA habilitado', async ({ page }) => {
    await page.goto('/login');

    // Fill with 2FA user credentials
    await page.getByLabel(/correo/i).fill(MOCK_2FA_EMAIL);
    await page.getByLabel(/contraseña/i).fill(MOCK_ADMIN_PASSWORD);

    // Submit
    await page.getByRole('button', { name: /ingresar/i }).click();

    // Should show 2FA form (6 digit inputs)
    await page.waitForSelector('input[inputmode="numeric"]', { timeout: 5000 });

    // Should have 6 individual OTP inputs
    const otpInputs = page.locator('input[inputmode="numeric"]');
    await expect(otpInputs).toHaveCount(6);
  });

  // =========================================================================
  // Additional: Login form validation
  // =========================================================================
  test('debería validar campos obligatorios en el formulario de login', async ({ page }) => {
    await page.goto('/login');

    // Submit empty form
    await page.getByRole('button', { name: /ingresar/i }).click();

    // HTML5 validation should prevent submission (email field is required)
    // The button should NOT navigate away
    await expect(page).toHaveURL(/\/login/);

    // Email should show validation state
    const emailInput = page.getByLabel(/correo/i);
    await expect(emailInput).toHaveAttribute('required');
  });
});

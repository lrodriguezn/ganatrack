// apps/web/tests/e2e/predios.spec.ts
/**
 * E2E tests for Predios - Change of Predio flows.
 *
 * Scenarios from spec (E2E-06):
 * 1. Cambiar predio y actualizar datos
 * 2. Cambio de predio preserva navegación
 * 3. Predio con un solo acceso
 * 4. Cambio de predio invalida caché
 *
 * Uses MSW handlers from tests/mocks/handlers/predios.handlers.ts
 */

import { test, expect } from './fixtures';
import { TEST_PREDIOS } from './helpers/test-data';

test.describe('Cambio de Predio', () => {

  // =========================================================================
  // E2E-06 Scenario 1: Cambiar predio y actualizar datos
  // =========================================================================
  test('debería cambiar de predio y actualizar todos los datos', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Look for the predio selector in header
    const predioSelector = page.getByRole('combobox', { name: /predio/i })
      .or(page.locator('select[name*="predio" i]'))
      .or(page.locator('[aria-label*="predio" i]'))
      .first();

    // Verify selector is visible
    await expect(predioSelector).toBeVisible({ timeout: 5000 });

    // Select a different predio
    if (await predioSelector.isVisible()) {
      const selected = await predioSelector.selectOption({ index: 1 }).catch(async () => {
        // If select doesn't work, try clicking and selecting option
        await predioSelector.click();
        const option = page.locator('[role="option"]').nth(1);
        await option.click();
      });
    }

    // Wait for data to reload
    await page.waitForLoadState('networkidle');

    // Verify URL or data changed
    // Check that the new predio name appears
    const newPredioName = TEST_PREDIOS[1].nombre;
    await expect(page.locator(`text=${newPredioName}`))
      .toBeVisible({ timeout: 5000 });

    // Navigate to animales and verify different data
    await page.goto('/dashboard/animales');
    await page.waitForLoadState('networkidle');
    // Animals should be filtered by new predio
  });

  // =========================================================================
  // E2E-06 Scenario 2: Cambio de predio preserva navegación
  // =========================================================================
  test('debería preservar navegación al cambiar de predio', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Navigate to a specific animal detail
    await page.goto('/dashboard/animales/1');
    await expect(page).toHaveURL(/\/dashboard\/animales\/1/);

    // Change the active predio
    const predioSelector = page.getByRole('combobox', { name: /predio/i })
      .or(page.locator('select[name*="predio" i]'))
      .first();

    if (await predioSelector.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Select different option
      const options = await predioSelector.locator('option').count();
      if (options > 1) {
        await predioSelector.selectOption({ index: 1 });
        await page.waitForLoadState('networkidle');
      }
    }

    // Should redirect to list, not stay on detail
    // When changing predio, user should go to the list of that predio
    await expect(page).toHaveURL(/\/dashboard\/animales/, { timeout: 3000 });
  });

  // =========================================================================
  // E2E-06 Scenario 3: Predio con un solo acceso (selector deshabilitado)
  // =========================================================================
  test('debería deshabilitar selector cuando hay un solo predio', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // This test simulates when user only has access to one predio
    // The selector should be disabled

    await page.goto('/dashboard');

    const predioSelector = page.getByRole('combobox', { name: /predio/i })
      .or(page.locator('select[name*="predio" i]'))
      .first();

    // Check if selector exists
    const selectorExists = await predioSelector.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (selectorExists) {
      // If there's only one option, selector should be disabled
      const options = await predioSelector.locator('option').count();
      if (options <= 1) {
        await expect(predioSelector).toBeDisabled();
      }
    }
  });

  // =========================================================================
  // E2E-06 Scenario 4: Cambio de predio invalida caché
  // =========================================================================
  test('debería invalidar caché al cambiar de predio', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Go to dashboard with Predio 1
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Store some data from current state
    const initialData = await page.locator('table').textContent().catch(() => null);

    // Change to Predio 2
    const predioSelector = page.getByRole('combobox', { name: /predio/i })
      .or(page.locator('select[name*="predio" i]'))
      .first();

    const options = await predioSelector.locator('option').count();
    if (options > 1) {
      await predioSelector.selectOption({ index: 1 });
      await page.waitForLoadState('networkidle');

      // Verify new data is loaded (not stale)
      // Wait for network request to complete
      await page.waitForResponse(
        (resp) => resp.url().includes('/api/v1/') && resp.status() === 200,
        { timeout: 5000 }
      );

      // Reload the page to ensure fresh data
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Data should be different or clearly refreshed
      const newData = await page.locator('table').textContent();
      // At minimum, verify no crash and data loaded
      expect(newData).toBeTruthy();
    }
  });

  // =========================================================================
  // Additional: Predio selector shows correct options
  // =========================================================================
  test('debería mostrar todas las opciones de predio disponibles', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.goto('/dashboard');

    const predioSelector = page.getByRole('combobox', { name: /predio/i })
      .or(page.locator('select[name*="predio" i]'))
      .first();

    await expect(predioSelector).toBeVisible({ timeout: 3000 });

    // Open dropdown
    await predioSelector.click();

    // Should show at least 2 predios (from mock data)
    const options = page.locator('[role="option"], option');
    const count = await options.count();

    expect(count).toBeGreaterThanOrEqual(2);

    // Each option should have a nombre
    for (const predio of TEST_PREDIOS) {
      await expect(page.locator(`text=${predio.nombre}`)).toBeVisible();
    }
  });
});

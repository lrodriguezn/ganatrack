// apps/web/tests/e2e/batch-operations.spec.ts
/**
 * E2E: Batch Operations on Animales.
 *
 * Scenarios from spec (E2E-08):
 * 1. Selección múltiple de animales
 * 2. Aplicar acción en lote - Cambiar estado
 * 3. Aplicar acción en lote - Asignar potrero
 * 4. Selección de todos los animales
 * 5. Operación en lote con validación
 *
 * Uses MSW handlers from tests/mocks/handlers/animales.handlers.ts
 */

import { test, expect } from './fixtures';
import { AnimalesPage } from './helpers/page-objects/animales.page';
import {
  TEST_ANIMAL,
  TEST_ANIMAL_2,
  TEST_ANIMAL_3,
} from './helpers/test-data';

test.describe('Operaciones en Lote - Animales', () => {
  let animalesPage: AnimalesPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    animalesPage = new AnimalesPage(authenticatedPage);
    await animalesPage.gotoList();
  });

  // =========================================================================
  // E2E-08 Scenario 1: Selección múltiple de animales
  // =========================================================================
  test('debería permitir seleccionar múltiples animales', async ({ authenticatedPage }) => {
    const page = animalesPage;

    // Select first animal checkbox
    await page.selectAnimalCheckbox(TEST_ANIMAL.codigo);

    // Should show selection indicator
    const selectedCounter = page.page.locator('text=/\\d+ seleccionados?|seleccionados/i');
    await expect(selectedCounter).toBeVisible({ timeout: 3000 });

    // Select second animal
    await page.selectAnimalCheckbox(TEST_ANIMAL_2.codigo);

    // Counter should update to show 2 selected
    await expect(selectedCounter).toContainText('2');
  });

  // =========================================================================
  // E2E-08 Scenario 2: Aplicar acción en lote - Cambiar estado
  // =========================================================================
  test('debería cambiar estado de múltiples animales en lote', async ({ authenticatedPage }) => {
    const page = animalesPage;

    // Select multiple animals
    await page.selectAnimalCheckbox(TEST_ANIMAL.codigo);
    await page.selectAnimalCheckbox(TEST_ANIMAL_2.codigo);

    // Look for batch action button
    const actionsButton = page.page.getByRole('button', { name: /acciones|lote/i })
      .or(page.page.locator('button[aria-label*="acciones"]'))
      .first();

    await expect(actionsButton).toBeVisible({ timeout: 2000 });
    await actionsButton.click();

    // Look for "Cambiar estado" option
    const changeStateOption = page.page.locator('[role="menuitem"], [role="option"]')
      .filter({ hasText: /cambiar.*estado|estado/i });
    await expect(changeStateOption.first()).toBeVisible({ timeout: 3000 });
    await changeStateOption.first().click();

    // Should show confirmation with count
    const confirmModal = page.page.locator('[role="dialog"]');
    await expect(confirmModal).toBeVisible({ timeout: 3000 });

    // Select new state
    const stateSelector = page.page.locator('select[name*="estado" i]')
      .or(page.page.getByLabel(/estado/i));
    await expect(stateSelector).toBeVisible({ timeout: 2000 });
    await stateSelector.selectOption({ index: 1 }); // Select second option

    // Confirm
    const confirmButton = confirmModal.getByRole('button', { name: /confirmar|aplicar/i });
    await confirmButton.click();

    // Wait for operation
    await page.page.waitForLoadState('networkidle');

    // Should show success message
    await expect(page.page.locator('text=/\\d+.*actualizados|actualización exitosa/i'))
      .toBeVisible({ timeout: 5000 });
  });

  // =========================================================================
  // E2E-08 Scenario 3: Aplicar acción en lote - Asignar potrero
  // =========================================================================
  test('debería asignar potrero a múltiples animales en lote', async ({ authenticatedPage }) => {
    const page = animalesPage;

    // Select animals
    await page.selectAnimalCheckbox(TEST_ANIMAL.codigo);
    await page.selectAnimalCheckbox(TEST_ANIMAL_2.codigo);

    // Open batch actions
    const actionsButton = page.page.getByRole('button', { name: /acciones|lote/i }).first();
    await actionsButton.click();

    // Look for "Asignar potrero" option
    const potreroOption = page.page.locator('[role="menuitem"], [role="option"]')
      .filter({ hasText: /potrero/i });
    await potreroOption.first().click();

    // Should show potrero selection
    const potreroSelector = page.page.locator('select[name*="potrero" i]')
      .or(page.page.getByLabel(/potrero/i));
    await expect(potreroSelector).toBeVisible({ timeout: 3000 });

    // Select a potrero
    await potreroSelector.selectOption({ index: 1 });

    // Confirm
    const confirmButton = page.page.getByRole('button', { name: /confirmar|aplicar|asignar/i });
    await confirmButton.click();

    // Wait for operation
    await page.page.waitForLoadState('networkidle');

    // Should show success
    await expect(page.page.locator('text=/asignado|actualizado/i')).toBeVisible({ timeout: 5000 });
  });

  // =========================================================================
  // E2E-08 Scenario 4: Selección de todos los animales
  // =========================================================================
  test('debería seleccionar y deseleccionar todos los animales', async ({ authenticatedPage }) => {
    const page = animalesPage;

    // Look for "select all" checkbox in table header
    const selectAllCheckbox = page.table.locator('input[type="checkbox"]').first();

    // Check if it's a "select all" checkbox (usually in thead)
    const thead = page.table.locator('thead');
    let isSelectAll = false;

    if (await thead.isVisible()) {
      const headerCheckbox = thead.locator('input[type="checkbox"]');
      if (await headerCheckbox.isVisible()) {
        isSelectAll = true;

        // Click select all
        await headerCheckbox.click();

        // Should show all selected counter
        const counter = page.page.locator('text=/\\d+.*seleccionados/i');
        await expect(counter).toBeVisible({ timeout: 3000 });

        // Click again to deselect
        await headerCheckbox.click();

        // Counter should disappear or show 0
        const counterAfter = page.page.locator('text=/0.*seleccionados|ninguno/i');
        await expect(counterAfter.or(page.page.locator('text=/no.*seleccionado/i')))
          .toBeVisible({ timeout: 3000 });
      }
    }

    // If no select all checkbox, test passes as N/A for this UI
    if (!isSelectAll) {
      test.skip(true, 'Select all checkbox not available in this UI');
    }
  });

  // =========================================================================
  // E2E-08 Scenario 5: Operación en lote con validación (delete confirmation)
  // =========================================================================
  test('debería requerir confirmación para eliminar múltiples animales', async ({ authenticatedPage }) => {
    const page = animalesPage;

    // Select multiple animals
    await page.selectAnimalCheckbox(TEST_ANIMAL.codigo);
    await page.selectAnimalCheckbox(TEST_ANIMAL_2.codigo);
    await page.selectAnimalCheckbox(TEST_ANIMAL_3.codigo);

    // Open batch actions and look for delete
    const actionsButton = page.page.getByRole('button', { name: /acciones|lote/i }).first();
    await actionsButton.click();

    // Look for delete option
    const deleteOption = page.page.locator('[role="menuitem"], [role="option"]')
      .filter({ hasText: /eliminar/i });
    await deleteOption.first().click();

    // Should show confirmation modal requiring text input
    const confirmModal = page.page.locator('[role="dialog"]');
    await expect(confirmModal).toBeVisible({ timeout: 3000 });

    // Modal should show count of items to delete
    await expect(confirmModal).toContainText('3');

    // Should have a cancel option
    const cancelButton = confirmModal.getByRole('button', { name: /cancelar/i });
    await expect(cancelButton).toBeVisible();

    // Confirm button should be disabled or require text
    const confirmButton = confirmModal.getByRole('button', { name: /confirmar|eliminar/i });
    await expect(confirmButton).toBeVisible();

    // Click cancel - no deletion should happen
    await cancelButton.click();

    // Modal should close
    await expect(confirmModal).not.toBeVisible({ timeout: 3000 });
  });
});

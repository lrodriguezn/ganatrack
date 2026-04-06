// apps/web/tests/e2e/servicios-palpacion.spec.ts
/**
 * E2E: Servicios Palpación Wizard.
 *
 * Scenarios from spec (E2E-04):
 * 1. Completar wizard de palpación grupal exitosamente
 * 2. Wizard palpación sin seleccionar animales
 * 3. Navegación entre pasos del wizard
 * 4. Cancelar wizard en cualquier paso
 *
 * Uses MSW handlers from tests/mocks/handlers/servicios.handlers.ts
 * Uses Page Objects from helpers/page-objects/servicios-wizard.page.ts
 */

import { test, expect } from './fixtures';
import { ServiciosWizardPage } from './helpers/page-objects/servicios-wizard.page';
import { TEST_SERVICIO_PALPACION } from './helpers/test-data';

test.describe('Wizard Palpación Grupal', () => {
  let wizard: ServiciosWizardPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    wizard = new ServiciosWizardPage(authenticatedPage);
  });

  // =========================================================================
  // E2E-04 Scenario 1: Completar wizard de palpación grupal exitosamente
  // =========================================================================
  test('debería completar el wizard de palpación exitosamente', async ({ authenticatedPage }) => {
    const page = wizard;

    // Navigate to palpación wizard
    await page.gotoPalpacion();

    // Verify step 1 is shown
    await expect(page.stepIndicator).toContainText('1');

    // Fill Step 1: Event info
    await page.fechaInput.fill(TEST_SERVICIO_PALPACION.fecha);

    // Fill animal selection if available
    const animalSelector = page.page.locator('[role="combobox"], [role="listbox"]').first();
    if (await animalSelector.isVisible({ timeout: 2000 }).catch(() => false)) {
      await animalSelector.click();
      await page.page.locator('[role="option"]').first().click();
    }

    // Click Next
    await page.nextStep();

    // Verify step 2
    await expect(page.stepIndicator).toContainText('2');

    // Fill Step 2: Results
    await page.fillPalpacionStep2({
      resultado: TEST_SERVICIO_PALPACION.resultado,
      semanasGestacion: TEST_SERVICIO_PALPACION.semanasGestacion,
      observaciones: TEST_SERVICIO_PALPACION.observaciones,
    });

    // Click Next
    await page.nextStep();

    // Verify step 3 (summary)
    await expect(page.stepIndicator).toContainText('3');

    // Verify summary contains our data
    await page.verifySummary();
    await page.expectSummaryContains('GAN-001');

    // Submit wizard
    await page.submitWizard();

    // Should redirect to detail or show success
    const onDetailPage = page.page.url().includes('/servicios/');
    if (onDetailPage) {
      await expect(page.page).toHaveURL(/\/servicios\/\d+/);
    } else {
      // Check for success toast
      await expect(page.page.locator('text=/registrado|guardado|exitoso/i'))
        .toBeVisible({ timeout: 5000 });
    }
  });

  // =========================================================================
  // E2E-04 Scenario 2: Wizard palpación sin seleccionar animales
  // =========================================================================
  test('debería mostrar error si no hay animales seleccionados', async ({ authenticatedPage }) => {
    const page = wizard;

    // Navigate to palpación wizard
    await page.gotoPalpacion();

    // Fill Step 1
    await page.fechaInput.fill(TEST_SERVICIO_PALPACION.fecha);

    // Try to proceed without selecting animals
    await page.nextStep();

    // Should show error message
    await expect(page.page.locator('text=/seleccionar.*animal|al menos/i'))
      .toBeVisible({ timeout: 3000 });

    // Should still be on step 2 or back on step 1
    const currentUrl = page.page.url();
    expect(currentUrl).toContain('/palpacion');
  });

  // =========================================================================
  // E2E-04 Scenario 3: Navegación entre pasos del wizard
  // =========================================================================
  test('debería permitir navegación entre pasos preservando datos', async ({ authenticatedPage }) => {
    const page = wizard;

    // Navigate to palpación wizard
    await page.gotoPalpacion();

    // Fill Step 1
    const testDate = '2024-03-15';
    await page.fechaInput.fill(testDate);

    // Go to Step 2
    await page.nextStep();
    await expect(page.stepIndicator).toContainText('2');

    // Fill something in Step 2
    await page.observacionesTextarea.fill('Test observations');

    // Go back to Step 1
    await page.previousStep();
    await expect(page.stepIndicator).toContainText('1');

    // Data from Step 1 should be preserved
    await expect(page.fechaInput).toHaveValue(testDate);

    // Go to Step 2 again
    await page.nextStep();
    await expect(page.stepIndicator).toContainText('2');

    // Data from Step 2 should also be preserved
    await expect(page.observacionesTextarea).toHaveValue('Test observations');
  });

  // =========================================================================
  // E2E-04 Scenario 4: Cancelar wizard en cualquier paso
  // =========================================================================
  test('debería cancelar wizard y no guardar datos', async ({ authenticatedPage }) => {
    const page = wizard;

    // Navigate to palpación wizard
    await page.gotoPalpacion();

    // Fill some data
    await page.fechaInput.fill(TEST_SERVICIO_PALPACION.fecha);

    // Click Cancel
    await page.cancelButton.click();

    // Should show confirmation dialog
    const confirmDialog = page.page.locator('[role="dialog"], [class*="modal"]')
      .filter({ hasText: /cancelar|seguro/i });
    await expect(confirmDialog).toBeVisible({ timeout: 3000 });

    // Confirm cancellation
    const confirmButton = confirmDialog.getByRole('button', { name: /confirmar|si|cancelar/i });
    await confirmButton.click();

    // Should redirect to servicios list
    await expect(page.page).toHaveURL(/\/dashboard\/servicios/, { timeout: 5000 });

    // Go to palpación again and verify no data was saved
    await page.gotoPalpacion();
    await expect(page.fechaInput).not.toHaveValue(TEST_SERVICIO_PALPACION.fecha);
  });

  // =========================================================================
  // Additional: Validate step fields before proceeding
  // =========================================================================
  test('debería validar campos obligatorios antes de avanzar', async ({ authenticatedPage }) => {
    const page = wizard;

    // Navigate to palpación wizard
    await page.gotoPalpacion();

    // Try to proceed without filling required fields
    await page.nextStep();

    // Should show validation error for required fields
    const validationError = page.page.locator('[class*="error"], [aria-invalid="true"]');
    await expect(validationError.first()).toBeVisible({ timeout: 3000 });

    // Should still be on step 1
    await expect(page.stepIndicator).toContainText('1');
  });
});

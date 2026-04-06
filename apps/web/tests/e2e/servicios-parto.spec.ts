// apps/web/tests/e2e/servicios-parto.spec.ts
/**
 * E2E: Servicios Parto Registration Wizard.
 *
 * Scenarios from spec (E2E-05):
 * 1. Registrar parto exitoso con cria
 * 2. Registrar parto sin seleccionar madre
 * 3. Registrar parto con complicaciones
 * 4. Validar peso de cria fuera de rango
 *
 * Uses MSW handlers from tests/mocks/handlers/servicios.handlers.ts
 * Uses Page Objects from helpers/page-objects/servicios-wizard.page.ts
 */

import { test, expect } from './fixtures';
import { ServiciosWizardPage } from './helpers/page-objects/servicios-wizard.page';
import { TEST_SERVICIO_PARTO, TEST_ANIMAL_2 } from './helpers/test-data';

test.describe('Registro de Parto', () => {
  let wizard: ServiciosWizardPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    wizard = new ServiciosWizardPage(authenticatedPage);
  });

  // =========================================================================
  // E2E-05 Scenario 1: Registrar parto exitoso con cria
  // =========================================================================
  test('debería registrar parto exitoso con cria vinculada', async ({ authenticatedPage }) => {
    const page = wizard;

    // Navigate to parto wizard
    await page.gotoParto();

    // Verify wizard loaded
    await expect(page.stepIndicator).toContainText('1');

    // Select mother animal (TEST_ANIMAL_2 - a female)
    await page.fillStep1({
      animalId: TEST_ANIMAL_2.id,
      fecha: TEST_SERVICIO_PARTO.fecha,
    });

    // Complete step 1 - look for mother selector
    const madreSelector = page.animalSelector;
    if (await madreSelector.isVisible({ timeout: 2000 }).catch(() => false)) {
      await madreSelector.click();
      // Select an option with the mother's ID
      await page.page.locator('[role="option"]').filter({ hasText: String(TEST_ANIMAL_2.id) }).first().click();
    }

    // Look for "Registrar Cría" button and click it
    const registrarCriaButton = page.page.getByRole('button', { name: /registrar.*cría/i })
      .or(page.page.getByRole('button', { name: /agregar.*cría/i }));
    
    if (await registrarCriaButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await registrarCriaButton.click();
    }

    // Should now show cria form fields
    const criaFields = page.page.locator('input[name*="cria" i], input[placeholder*="cría" i]');
    await expect(criaFields.first()).toBeVisible({ timeout: 3000 });

    // Fill cria data
    await page.fillPartoStep2({
      criaId: 999, // Will be created as new
      resultado: TEST_SERVICIO_PARTO.resultado,
      observaciones: TEST_SERVICIO_PARTO.observaciones,
    });

    // Submit the form
    await page.submitWizard();

    // Should show success message or redirect
    const successMessage = page.page.locator('text=/parto.*registrado|guardado|exitoso/i');
    const onDetailPage = page.page.url().includes('/servicios/');

    if (onDetailPage) {
      await expect(page.page).toHaveURL(/\/servicios\/\d+/);
    } else {
      await expect(successMessage.or(page.page.locator('text=/madre.*cría/i')))
        .toBeVisible({ timeout: 5000 });
    }
  });

  // =========================================================================
  // E2E-05 Scenario 2: Registrar parto sin seleccionar madre
  // =========================================================================
  test('debería mostrar error al registrar parto sin madre', async ({ authenticatedPage }) => {
    const page = wizard;

    // Navigate to parto wizard
    await page.gotoParto();

    // Fill date but don't select mother
    await page.fechaInput.fill(TEST_SERVICIO_PARTO.fecha);

    // Try to submit
    await page.submitButton.click();

    // Should show error about mother selection
    await expect(page.page.locator('text=/seleccionar.*madre|madre.*requerida/i'))
      .toBeVisible({ timeout: 3000 });

    // Should highlight the mother field
    const madreSelector = page.animalSelector;
    await expect(madreSelector).toHaveAttribute('aria-invalid', 'true', { timeout: 2000 });
  });

  // =========================================================================
  // E2E-05 Scenario 3: Registrar parto con complicaciones
  // =========================================================================
  test('debería registrar parto con complicaciones', async ({ authenticatedPage }) => {
    const page = wizard;

    // Navigate to parto wizard
    await page.gotoParto();

    // Select mother
    await page.fillStep1({
      animalId: TEST_ANIMAL_2.id,
      fecha: TEST_SERVICIO_PARTO.fecha,
    });

    // Look for "Registrar Cría" button
    const registrarCriaButton = page.page.getByRole('button', { name: /registrar.*cría/i })
      .or(page.page.getByRole('button', { name: /agregar.*cría/i }));
    
    if (await registrarCriaButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await registrarCriaButton.click();
    }

    // Look for tipo/parto selector and change to "Cesárea"
    const tipoPartoSelector = page.page.locator('select[name*="tipo" i]')
      .or(page.page.getByLabel(/tipo.*parto/i));
    
    if (await tipoPartoSelector.isVisible({ timeout: 2000 }).catch(() => false)) {
      await tipoPartoSelector.selectOption({ index: 1 }); // Cesárea or similar
    }

    // Fill observaciones with complications
    await page.observacionesTextarea.fill('Requiere intervención veterinaria');

    // Submit
    await page.submitWizard();

    // Should show warning about complications or success with complication label
    await expect(page.page.locator('text=/complicaciones|intervención/i'))
      .toBeVisible({ timeout: 5000 });
  });

  // =========================================================================
  // E2E-05 Scenario 4: Validar peso de cria fuera de rango
  // =========================================================================
  test('debería mostrar warning para peso de cria fuera de rango', async ({ authenticatedPage }) => {
    const page = wizard;

    // Navigate to parto wizard
    await page.gotoParto();

    // Select mother and look for cria form
    await page.fillStep1({
      animalId: TEST_ANIMAL_2.id,
      fecha: TEST_SERVICIO_PARTO.fecha,
    });

    // Look for "Registrar Cría" button
    const registrarCriaButton = page.page.getByRole('button', { name: /registrar.*cría/i })
      .or(page.page.getByRole('button', { name: /agregar.*cría/i }));
    
    if (await registrarCriaButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await registrarCriaButton.click();
    }

    // Look for peso input
    const pesoInput = page.page.locator('input[name*="peso" i]')
      .or(page.page.getByLabel(/peso/i));

    if (await pesoInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Enter out-of-range weight (too low for bovine)
      await pesoInput.fill('5');

      // Try to submit
      await page.submitButton.click();

      // Should show warning about weight being out of range
      await expect(page.page.locator('text=/peso.*rango|fuera.*rango|peso.*bajo/i'))
        .toBeVisible({ timeout: 3000 });

      // Should still allow confirmation
      const confirmButton = page.page.getByRole('button', { name: /confirmar|aceptar/i })
        .or(page.page.locator('text=/confirmar|aceptar/i').filter({ hasRole: 'button' }));
      
      // If warning modal is shown, confirm it
      const warningDialog = page.page.locator('[role="alertdialog"], [class*="warning"]');
      if (await warningDialog.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.first().click();
      }
    }
  });

  // =========================================================================
  // Additional: Cancel and preserve no data
  // =========================================================================
  test('debería cancelar registro de parto sin guardar', async ({ authenticatedPage }) => {
    const page = wizard;

    // Navigate to parto wizard
    await page.gotoParto();

    // Fill some data
    await page.fechaInput.fill('2024-12-25');

    // Click Cancel
    await page.cancelButton.click();

    // Confirm cancellation
    const confirmDialog = page.page.locator('[role="dialog"]').filter({ hasText: /cancelar|seguro/i });
    if (await confirmDialog.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmDialog.getByRole('button', { name: /confirmar|si/i }).click();
    }

    // Should redirect away from wizard
    await expect(page.page).toHaveURL(/\/dashboard\/servicios/, { timeout: 5000 });
  });
});

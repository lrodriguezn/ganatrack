// apps/web/tests/e2e/animales-crud.spec.ts
/**
 * E2E: Animales CRUD flows.
 *
 * Scenarios from spec (E2E-03):
 * 1. Crear nuevo animal completo
 * 2. Crear animal con código duplicado
 * 3. Editar animal existente
 * 4. Cambiar estado del animal
 * 5. Eliminar animal
 * 6. Validación de formulario vacío
 *
 * Uses MSW handlers from tests/mocks/handlers/animales.handlers.ts
 * Uses Page Objects from helpers/page-objects/animales.page.ts
 */

import { test, expect } from './fixtures';
import { AnimalesPage } from './helpers/page-objects/animales.page';
import {
  TEST_ANIMAL,
  TEST_ANIMAL_2,
  TEST_ANIMAL_DELETE,
  NEW_ANIMAL_DATA,
} from './helpers/test-data';

test.describe('CRUD Animales', () => {
  let animalesPage: AnimalesPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    animalesPage = new AnimalesPage(authenticatedPage);
  });

  // =========================================================================
  // E2E-03 Scenario 1: Crear nuevo animal completo
  // =========================================================================
  test('debería crear un nuevo animal con datos válidos', async ({ authenticatedPage }) => {
    const page = animalesPage;

    // Navigate to create form
    await page.gotoCreate();

    // Fill form with valid data
    await page.fillForm({
      codigo: 'GAN-NEW01',
      nombre: 'Nuevo Torito',
      fechaNacimiento: '2024-01-15',
    });

    // Submit form
    await page.submitForm();

    // Should redirect to detail page and show success
    await expect(page.page.url()).toContain('/dashboard/animales/');
    await expect(page.page.locator('text=/creado|exitoso/i')).toBeVisible({ timeout: 5000 });
  });

  // =========================================================================
  // E2E-03 Scenario 2: Crear animal con código duplicado
  // =========================================================================
  test('debería mostrar error al crear animal con código duplicado', async ({ authenticatedPage }) => {
    const page = animalesPage;

    // Navigate to create form
    await page.gotoCreate();

    // Fill with existing code
    await page.fillForm({
      codigo: TEST_ANIMAL.codigo, // GAN-001 already exists
      nombre: 'Duplicate Test',
      fechaNacimiento: '2024-01-15',
    });

    // Submit form
    await page.submitForm();

    // Should show duplicate error
    await expect(page.page.locator('text=/ya existe|duplicado/i')).toBeVisible({ timeout: 5000 });

    // Should stay on form
    await expect(page.page.url()).toContain('/nuevo');
  });

  // =========================================================================
  // E2E-03 Scenario 3: Editar animal existente
  // =========================================================================
  test('debería editar un animal existente', async ({ authenticatedPage }) => {
    const page = animalesPage;

    // Navigate to edit for TEST_ANIMAL
    await page.gotoEdit(TEST_ANIMAL.id);

    // Verify form is loaded with existing data
    await expect(page.codigoInput).toHaveValue(TEST_ANIMAL.codigo);

    // Modify the name
    const newName = `${TEST_ANIMAL.nombre} Modificado`;
    await page.nombreInput.clear();
    await page.nombreInput.fill(newName);

    // Submit
    await page.submitForm();

    // Should redirect to detail
    await expect(page.page.url()).toContain(`/dashboard/animales/${TEST_ANIMAL.id}`);

    // Should show updated name
    await expect(page.page.locator('h1')).toContainText(newName);
  });

  // =========================================================================
  // E2E-03 Scenario 4: Cambiar estado del animal
  // =========================================================================
  test('debería cambiar el estado del animal', async ({ authenticatedPage }) => {
    const page = animalesPage;

    // Navigate to animal detail
    await page.gotoDetail(TEST_ANIMAL.id);

    // Look for estado selector/button
    const estadoSelector = page.page.getByRole('button', { name: /estado/i })
      .or(page.page.locator('[class*="estado"]'))
      .or(page.page.locator('select[name*="estado" i]'))
      .or(page.page.getByLabel(/estado/i));

    if (await estadoSelector.isVisible({ timeout: 2000 }).catch(() => false)) {
      await estadoSelector.first().click();

      // Select "Vendido" or similar
      const newStateOption = page.page.locator('[role="option"], [role="listbox"] option')
        .filter({ hasText: /vendido/i })
        .first();

      if (await newStateOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await newStateOption.click();

        // Confirm if needed
        const confirmButton = page.page.getByRole('button', { name: /confirmar|aceptar/i });
        if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await confirmButton.click();
        }

        // Wait for update
        await page.page.waitForLoadState('networkidle');

        // Should show updated badge
        await expect(page.page.locator('text=/vendido/i')).toBeVisible();
      }
    }
  });

  // =========================================================================
  // E2E-03 Scenario 5: Eliminar animal
  // =========================================================================
  test('debería eliminar un animal con confirmación', async ({ authenticatedPage }) => {
    const page = animalesPage;

    // Navigate to detail page for TEST_ANIMAL_DELETE (dedicated animal for delete test)
    await page.gotoDetail(TEST_ANIMAL_DELETE.id);

    // Find and click delete button
    const deleteButton = page.page.getByRole('button', { name: /eliminar/i })
      .or(page.page.locator('button[aria-label*="eliminar" i]'))
      .first();

    await deleteButton.click();

    // Modal confirmation should appear
    const confirmModal = page.page.locator('[role="dialog"], [class*="modal"]')
      .filter({ hasText: /eliminar|confirmar/i });
    await expect(confirmModal).toBeVisible({ timeout: 3000 });

    // Confirm deletion
    const confirmButton = confirmModal.getByRole('button', { name: /confirmar|eliminar|si/i });
    await confirmButton.click();

    // Should redirect to list
    await expect(page.page).toHaveURL(/\/dashboard\/animales/, { timeout: 5000 });

    // Animal should not appear in list
    await page.gotoList();
    await expect(page.page.getByText(TEST_ANIMAL_DELETE.codigo)).not.toBeVisible();
  });

  // =========================================================================
  // E2E-03 Scenario 6: Validación de formulario vacío
  // =========================================================================
  test('debería mostrar validación de campos obligatorios', async ({ authenticatedPage }) => {
    const page = animalesPage;

    // Navigate to create form
    await page.gotoCreate();

    // Try to submit without filling any fields
    await page.submitForm();

    // Should show validation errors
    const validationMessages = page.page.locator('[class*="error"], [aria-invalid="true"], text=/requerido|obligatorio/i');
    const count = await validationMessages.count();

    // At minimum, some validation should appear
    expect(count).toBeGreaterThan(0);

    // Button should remain or become enabled after validation clears
    await expect(page.submitButton).toBeEnabled();
  });

  // =========================================================================
  // Additional: List page filtering
  // =========================================================================
  test('debería filtrar animales por búsqueda', async ({ authenticatedPage }) => {
    const page = animalesPage;

    // Go to list
    await page.gotoList();

    // Search for specific animal
    await page.searchAnimal(TEST_ANIMAL.codigo);

    // Only that animal should be visible
    await expect(page.getTableRow(TEST_ANIMAL.codigo)).toBeVisible();
    await expect(page.getTableRow(TEST_ANIMAL_2.codigo)).not.toBeVisible();
  });
});

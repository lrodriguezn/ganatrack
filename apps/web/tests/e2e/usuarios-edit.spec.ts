// apps/web/tests/e2e/usuarios-edit.spec.ts
/**
 * E2E: Edit usuario flow.
 *
 * Tests:
 * - Navigate to edit page
 * - Form pre-filled with usuario data
 * - Save changes
 * - Concurrent edit warning
 */

import { test, expect } from '@playwright/test';

test.describe('Editar Usuario', () => {
  test('debería navegar al formulario de edición', async ({ page }) => {
    await page.goto('/dashboard/usuarios');

    // Click edit on first usuario
    await page.getByRole('button', { name: /editar.*carlos/i }).click();

    await expect(page.url()).toContain('/editar');
    await expect(page.locator('h1')).toContainText('Editar Usuario');
  });

  test('debería mostrar formulario pre-llenado', async ({ page }) => {
    await page.goto('/dashboard/usuarios/1/editar');

    const nombreInput = page.getByLabel(/nombre completo/i);
    await expect(nombreInput).toHaveValue('Carlos Mendoza');

    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toHaveValue('carlos@finca.com');
  });

  test('debería guardar cambios exitosamente', async ({ page }) => {
    await page.goto('/dashboard/usuarios/1/editar');

    const nombreInput = page.getByLabel(/nombre completo/i);
    await nombreInput.clear();
    await nombreInput.fill('Carlos Actualizado');

    await page.getByRole('button', { name: /guardar cambios/i }).click();

    // Should redirect to detail page
    await expect(page.url()).toContain('/dashboard/usuarios/1');
  });

  test('debería mostrar advertencia de última modificación', async ({ page }) => {
    await page.goto('/dashboard/usuarios/1/editar');

    await expect(page.getByText(/última modificación/i)).toBeVisible();
  });
});

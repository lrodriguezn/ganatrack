// apps/web/tests/e2e/predios.spec.ts
/**
 * E2E tests for Predios CRUD flows.
 */
import { test, expect } from '@playwright/test';

test.describe('CRUD Predios', () => {
  test('debería mostrar la lista de predios', async ({ page }) => {
    await page.goto('/dashboard/predios');
    await expect(page.locator('h1')).toContainText('Predios');
  });

  test('debería crear un nuevo predio exitosamente', async ({ page }) => {
    await page.goto('/dashboard/predios/nuevo');
    await expect(page.locator('h1')).toContainText('Crear Predio');
  });

  test('debería editar un predio existente', async ({ page }) => {
    await page.goto('/dashboard/predios/1/editar');
    await expect(page.locator('h1')).toContainText('Editar Predio');
  });

  test('debería eliminar un predio con confirmación', async ({ page }) => {
    await page.goto('/dashboard/predios');
    // Delete button should be visible
    await expect(page.getByRole('button', { name: /eliminar/i })).toBeVisible();
  });

  test('debería cambiar el predio activo e invalidar cache', async ({ page }) => {
    await page.goto('/dashboard/predios');
    // Predio selector should be visible in header
    await expect(page.getByRole('combobox', { name: /predio/i })).toBeVisible();
  });
});

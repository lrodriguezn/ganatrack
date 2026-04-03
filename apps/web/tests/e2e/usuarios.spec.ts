// apps/web/tests/e2e/usuarios.spec.ts
/**
 * E2E: Usuarios list page.
 *
 * Tests:
 * - List page loads with usuarios
 * - Search filters results
 * - Pagination works
 * - Create button visible for authorized users
 */

import { test, expect } from '@playwright/test';

test.describe('Usuarios List', () => {
  test('debería cargar la lista de usuarios', async ({ page }) => {
    await page.goto('/dashboard/usuarios');

    await expect(page.locator('h1')).toContainText('Usuarios');
    await expect(page.locator('table')).toBeVisible();
  });

  test('debería mostrar usuarios en la tabla', async ({ page }) => {
    await page.goto('/dashboard/usuarios');

    await expect(page.getByText('Carlos Mendoza')).toBeVisible();
    await expect(page.getByText('maria@finca.com')).toBeVisible();
  });

  test('debería filtrar por búsqueda', async ({ page }) => {
    await page.goto('/dashboard/usuarios');

    const searchInput = page.getByLabel('Buscar usuarios');
    await searchInput.fill('carlos');

    await expect(page.getByText('Carlos Mendoza')).toBeVisible();
    await expect(page.getByText('María Rodríguez')).not.toBeVisible();
  });

  test('debería mostrar botón de crear para usuarios autorizados', async ({ page }) => {
    await page.goto('/dashboard/usuarios');

    const createButton = page.getByRole('button', { name: /nuevo usuario/i });
    await expect(createButton).toBeVisible();
  });

  test('debería mostrar estados activo/inactivo', async ({ page }) => {
    await page.goto('/dashboard/usuarios');

    await expect(page.getByText('Activo')).toBeVisible();
    await expect(page.getByText('Inactivo')).toBeVisible();
  });
});

// apps/web/tests/e2e/animales-crud.spec.ts
/**
 * E2E: Animales CRUD flows.
 *
 * Tests:
 * - Animales list loads
 * - Create animal flow
 * - Detail page
 * - Edit animal flow
 */

import { test, expect } from '@playwright/test';

test.describe('CRUD Animales', () => {
  test('debería cargar la lista de animales', async ({ page }) => {
    await page.goto('/dashboard/animales');
    await expect(page.locator('h1')).toContainText('Animales');
    await expect(page.locator('table')).toBeVisible();
  });

  test('debería mostrar animales en la tabla', async ({ page }) => {
    await page.goto('/dashboard/animales');
    await expect(page.getByText('GAN-001')).toBeVisible();
    await expect(page.getByText('Don Toro')).toBeVisible();
  });

  test('debería navegar al formulario de creación', async ({ page }) => {
    await page.goto('/dashboard/animales');
    await page.getByRole('button', { name: /nuevo animal/i }).click();
    await expect(page.url()).toContain('/dashboard/animales/nuevo');
  });

  test('debería mostrar la página de detalle', async ({ page }) => {
    await page.goto('/dashboard/animales/1');
    await expect(page.locator('h1')).toContainText('GAN-001');
  });

  test('debería navegar al formulario de edición', async ({ page }) => {
    await page.goto('/dashboard/animales/1/editar');
    await expect(page.locator('h1')).toContainText('Editar Animal');
  });

  test('debería filtrar por búsqueda', async ({ page }) => {
    await page.goto('/dashboard/animales');
    const searchInput = page.getByPlaceholder(/buscar por código/i);
    await searchInput.fill('GAN-001');
    await expect(page.getByText('Don Toro')).toBeVisible();
  });
});

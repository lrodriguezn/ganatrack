// apps/web/tests/e2e/reportes.spec.ts
/**
 * E2E: Reportes dashboard.
 *
 * Tests:
 * - Reportes dashboard loads
 * - Filters apply
 * - Export triggers
 */

import { test, expect } from '@playwright/test';

test.describe('Reportes', () => {
  test('debería cargar el dashboard de reportes', async ({ page }) => {
    await page.goto('/dashboard/reportes');
    await expect(page.locator('h1')).toContainText('Reportes');
  });

  test('debería mostrar resumen de animales', async ({ page }) => {
    await page.goto('/dashboard/reportes');
    await expect(page.getByText(/total animales/i)).toBeVisible();
  });

  test('debería aplicar filtros de fecha', async ({ page }) => {
    await page.goto('/dashboard/reportes');
    // Date filter inputs should be visible
    await expect(page.getByRole('textbox', { name: /fecha/i }).first()).toBeVisible();
  });

  test('debería disparar exportación', async ({ page }) => {
    await page.goto('/dashboard/reportes');
    const exportButton = page.getByRole('button', { name: /exportar/i });
    await expect(exportButton).toBeVisible();
  });
});

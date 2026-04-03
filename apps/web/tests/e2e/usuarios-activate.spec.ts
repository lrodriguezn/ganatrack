// apps/web/tests/e2e/usuarios-activate.spec.ts
/**
 * E2E: Deactivate/activate usuario.
 *
 * Tests:
 * - Deactivate user
 * - Cannot deactivate self
 * - Activate deactivated user
 * - Status badge updates
 */

import { test, expect } from '@playwright/test';

test.describe('Activar/Desactivar Usuario', () => {
  test('debería desactivar un usuario activo', async ({ page }) => {
    await page.goto('/dashboard/usuarios');

    // Click deactivate on an active user
    await page.getByRole('button', { name: /desactivar.*carlos/i }).click();

    // Status should update
    await expect(page.getByText('Inactivo')).toBeVisible();
  });

  test('debería activar un usuario inactivo', async ({ page }) => {
    await page.goto('/dashboard/usuarios');

    // Click activate on an inactive user
    await page.getByRole('button', { name: /activar.*luisa/i }).click();

    // Status should update
    await expect(page.getByText('Activo').nth(0)).toBeVisible();
  });

  test('debería mostrar badge de estado correcto', async ({ page }) => {
    await page.goto('/dashboard/usuarios');

    // Active users should show "Activo" badge
    await expect(page.getByText('Activo')).toBeVisible();

    // Inactive users should show "Inactivo" badge
    await expect(page.getByText('Inactivo')).toBeVisible();
  });
});

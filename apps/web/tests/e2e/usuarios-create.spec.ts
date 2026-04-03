// apps/web/tests/e2e/usuarios-create.spec.ts
/**
 * E2E: Create usuario flow.
 *
 * Tests:
 * - Navigate to create page
 * - Fill form and submit
 * - Validation errors display
 * - Success redirect
 * - Duplicate email rejection
 */

import { test, expect } from '@playwright/test';

test.describe('Crear Usuario', () => {
  test('debería navegar al formulario de creación', async ({ page }) => {
    await page.goto('/dashboard/usuarios');
    await page.getByRole('button', { name: /nuevo usuario/i }).click();

    await expect(page.url()).toContain('/dashboard/usuarios/nuevo');
    await expect(page.locator('h1')).toContainText('Crear Usuario');
  });

  test('debería mostrar errores de validación', async ({ page }) => {
    await page.goto('/dashboard/usuarios/nuevo');

    // Submit empty form
    await page.getByRole('button', { name: /crear usuario/i }).click();

    await expect(page.getByText(/nombre requerido/i)).toBeVisible();
  });

  test('debería crear usuario exitosamente', async ({ page }) => {
    await page.goto('/dashboard/usuarios/nuevo');

    await page.getByLabel(/nombre completo/i).fill('Nuevo Usuario E2E');
    await page.getByLabel(/email/i).fill('nuevo-e2e@finca.com');
    await page.getByLabel(/contraseña/i).fill('Password123');
    await page.getByLabel(/rol/i).selectOption('2');

    await page.getByRole('button', { name: /crear usuario/i }).click();

    // Should redirect to list
    await expect(page.url()).toContain('/dashboard/usuarios');
  });

  test('debería rechazar email duplicado', async ({ page }) => {
    await page.goto('/dashboard/usuarios/nuevo');

    await page.getByLabel(/nombre completo/i).fill('Duplicado');
    await page.getByLabel(/email/i).fill('carlos@finca.com');
    await page.getByLabel(/contraseña/i).fill('Password123');
    await page.getByLabel(/rol/i).selectOption('1');

    await page.getByRole('button', { name: /crear usuario/i }).click();

    await expect(page.getByText(/ya está registrado/i)).toBeVisible();
  });
});

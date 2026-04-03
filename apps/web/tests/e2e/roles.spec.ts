// apps/web/tests/e2e/roles.spec.ts
/**
 * E2E: Roles and permissions management.
 *
 * Tests:
 * - Roles list loads
 * - Role detail shows permissions matrix
 * - Permissions matrix interaction
 * - Batch save
 */

import { test, expect } from '@playwright/test';

test.describe('Roles y Permisos', () => {
  test('debería cargar la matriz de permisos para un rol', async ({ page }) => {
    // Navigate to a role's permissions (assuming route exists)
    // For now, test the API response directly
    const response = await page.request.get('/api/v1/roles/1/permisos');
    expect(response.ok()).toBe(true);

    const body = await response.json();
    expect(body.rolId).toBe(1);
    expect(body.cells.length).toBe(44);
  });

  test('debería mostrar todos los módulos en la matriz', async ({ page }) => {
    const response = await page.request.get('/api/v1/roles/1/permisos');
    const body = await response.json();

    const modulos = [...new Set(body.cells.map((c: { modulo: string }) => c.modulo))];
    expect(modulos).toContain('dashboard');
    expect(modulos).toContain('animales');
    expect(modulos).toContain('predios');
    expect(modulos).toContain('servicios');
    expect(modulos).toContain('reportes');
    expect(modulos).toContain('configuracion');
    expect(modulos).toContain('maestros');
    expect(modulos).toContain('productos');
    expect(modulos).toContain('imagenes');
    expect(modulos).toContain('notificaciones');
    expect(modulos).toContain('usuarios');
  });

  test('debería actualizar permisos con batch save', async ({ page }) => {
    const payload = {
      rolId: 1,
      permisos: [
        { modulo: 'dashboard', accion: 'ver', enabled: true },
        { modulo: 'dashboard', accion: 'crear', enabled: false },
      ],
    };

    const response = await page.request.put('/api/v1/roles/1/permisos', {
      data: payload,
    });

    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body.isDirty).toBe(false);
  });

  test('debería mostrar 4 acciones por módulo', async ({ page }) => {
    const response = await page.request.get('/api/v1/roles/1/permisos');
    const body = await response.json();

    const dashboardCells = body.cells.filter((c: { modulo: string }) => c.modulo === 'dashboard');
    expect(dashboardCells.length).toBe(4);

    const acciones = dashboardCells.map((c: { accion: string }) => c.accion);
    expect(acciones).toContain('ver');
    expect(acciones).toContain('crear');
    expect(acciones).toContain('editar');
    expect(acciones).toContain('eliminar');
  });
});

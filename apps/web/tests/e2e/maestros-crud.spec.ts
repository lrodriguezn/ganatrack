// apps/web/tests/e2e/maestros-crud.spec.ts
/**
 * E2E: Maestros CRUD flows for all 8 entities.
 *
 * Tests the generic MaestroEntityPage component across all maestro types:
 *
 * Field alignment fixes (verify correct fields are used):
 * - Propietarios: tipoDocumento + numeroDocumento (NOT documento)
 * - Hierros: nombre + descripcion (NOT codigo, imagen_url)
 * - Diagnósticos: categoria (NOT tipo)
 * - Lugares Compra: tipo + ubicacion + contacto + telefono (NOT municipio, departamento)
 * - Lugares Venta: same as Compra
 *
 * Regression entities (already working, verify no breakage):
 * - Veterinarios
 * - Motivos Venta
 * - Causas Muerte
 *
 * Each entity tests:
 * 1. CREATE: Navigate to page, fill form, submit, verify item appears
 * 2. UPDATE: Click edit, modify field, save, verify change
 * 3. DELETE: Click delete, confirm, verify item removed
 */

import { test, expect } from './fixtures';
import { MaestrosPage } from './helpers/page-objects/maestros.page';
import {
  MAESTROS_ENTITIES,
  ALL_MAESTROS_ENTITIES,
  FIX_ENTITIES,
  REGRESSION_ENTITIES,
} from './helpers/test-data';

// =============================================================================
// CREATE tests — for all 8 entities
// =============================================================================

test.describe('Maestros — Crear (todos los entidades)', () => {
  for (const entityKey of ALL_MAESTROS_ENTITIES) {
    const entity = MAESTROS_ENTITIES[entityKey];

    test(`debería crear un nuevo ${entity.singularName} (${entity.tipo}) con datos válidos`, async ({ authenticatedPage }) => {
      const maestrosPage = new MaestrosPage(authenticatedPage, {
        tipo: entity.tipo,
        singularName: entity.singularName,
      });

      // Navigate to list
      await maestrosPage.gotoList();
      await maestrosPage.expectListPage();

      // Open create modal
      await maestrosPage.clickNuevo();
      await maestrosPage.expectFormModalVisible();

      // Fill form fields
      await maestrosPage.fillFields(entity.fields.create);

      // Submit
      await maestrosPage.submitForm();

      // Verify success toast
      await maestrosPage.expectSuccessToast(
        `${entity.singularName} creado correctamente`,
      );

      // Verify the new item appears in the table
      await maestrosPage.expectEntityInTable(entity.newName);
    });
  }
});

// =============================================================================
// UPDATE tests — for all 8 entities
// =============================================================================

test.describe('Maestros — Actualizar (todos los entidades)', () => {
  for (const entityKey of ALL_MAESTROS_ENTITIES) {
    const entity = MAESTROS_ENTITIES[entityKey];

    test(`debería actualizar un ${entity.singularName} (${entity.tipo}) existente`, async ({ authenticatedPage }) => {
      const maestrosPage = new MaestrosPage(authenticatedPage, {
        tipo: entity.tipo,
        singularName: entity.singularName,
      });

      // Navigate to list
      await maestrosPage.gotoList();
      await maestrosPage.expectListPage();

      // Verify existing item is in table
      await maestrosPage.expectEntityInTable(entity.existingName);

      // Click edit on existing item
      await maestrosPage.clickEditEntity(entity.existingName);
      await maestrosPage.expectFormModalVisible();

      // Fill update fields (only the fields we want to change)
      await maestrosPage.fillFields(entity.fields.update);

      // Submit
      await maestrosPage.submitForm();

      // Verify success toast
      await maestrosPage.expectSuccessToast(
        `${entity.singularName} actualizado correctamente`,
      );
    });
  }
});

// =============================================================================
// DELETE tests — for all 8 entities
// =============================================================================

test.describe('Maestros — Eliminar (todos los entidades)', () => {
  for (const entityKey of ALL_MAESTROS_ENTITIES) {
    const entity = MAESTROS_ENTITIES[entityKey];

    test(`debería eliminar un ${entity.singularName} (${entity.tipo}) con confirmación`, async ({ authenticatedPage }) => {
      const maestrosPage = new MaestrosPage(authenticatedPage, {
        tipo: entity.tipo,
        singularName: entity.singularName,
      });

      // Navigate to list
      await maestrosPage.gotoList();
      await maestrosPage.expectListPage();

      // Click delete on existing item
      await maestrosPage.clickDeleteEntity(entity.existingName);
      await maestrosPage.expectDeleteModalVisible();

      // Confirm deletion
      await maestrosPage.confirmDelete();

      // Verify success toast
      await maestrosPage.expectSuccessToast(
        `${entity.singularName} eliminado correctamente`,
      );

      // Verify item is no longer in table
      await maestrosPage.expectEntityNotInTable(entity.existingName);
    });
  }
});

// =============================================================================
// Field alignment regression — verify correct fields exist in forms
// =============================================================================

test.describe('Maestros — Regresión de campos (entidades corregidas)', () => {
  // Propietarios: should have tipoDocumento + numeroDocumento, NOT documento
  test('propietarios debería tener campos tipoDocumento y numeroDocumento (no documento)', async ({ authenticatedPage }) => {
    const maestrosPage = new MaestrosPage(authenticatedPage, {
      tipo: 'propietarios',
      singularName: 'Propietario',
    });

    await maestrosPage.gotoList();
    await maestrosPage.clickNuevo();
    await maestrosPage.expectFormModalVisible();

    // Verify correct fields exist
    await expect(maestrosPage.getFormField('Nombre')).toBeVisible();
    await expect(maestrosPage.getFormField('Tipo de documento')).toBeVisible();
    await expect(maestrosPage.getFormField('Número de documento')).toBeVisible();
    await expect(maestrosPage.getFormField('Teléfono')).toBeVisible();
    await expect(maestrosPage.getFormField('Correo electrónico')).toBeVisible();

    // Verify table columns are correct
    await maestrosPage.cancelForm();
    await expect(maestrosPage.table).toBeVisible();
    await expect(maestrosPage.table.locator('th')).toContainText('Tipo Doc.');
    await expect(maestrosPage.table.locator('th')).toContainText('Número Doc.');
  });

  // Hierros: should have nombre + descripcion, NOT codigo or imagen_url
  test('hierros debería tener campos nombre y descripcion (no codigo, imagen_url)', async ({ authenticatedPage }) => {
    const maestrosPage = new MaestrosPage(authenticatedPage, {
      tipo: 'hierros',
      singularName: 'Hierro',
    });

    await maestrosPage.gotoList();
    await maestrosPage.clickNuevo();
    await maestrosPage.expectFormModalVisible();

    // Verify correct fields exist
    await expect(maestrosPage.getFormField('Nombre')).toBeVisible();
    await expect(maestrosPage.getFormField('Descripción')).toBeVisible();

    // Table should have correct columns
    await maestrosPage.cancelForm();
    await expect(maestrosPage.table.locator('th')).toContainText('Nombre');
    await expect(maestrosPage.table.locator('th')).toContainText('Descripción');
  });

  // Diagnósticos: should have categoria, NOT tipo
  test('diagnósticos debería tener campo categoria (no tipo)', async ({ authenticatedPage }) => {
    const maestrosPage = new MaestrosPage(authenticatedPage, {
      tipo: 'diagnosticos',
      singularName: 'Diagnóstico',
    });

    await maestrosPage.gotoList();
    await maestrosPage.clickNuevo();
    await maestrosPage.expectFormModalVisible();

    // Verify correct fields exist
    await expect(maestrosPage.getFormField('Nombre')).toBeVisible();
    await expect(maestrosPage.getFormField('Descripción')).toBeVisible();
    await expect(maestrosPage.getFormField('Categoría')).toBeVisible();

    // Table should show "Categoría" column
    await maestrosPage.cancelForm();
    await expect(maestrosPage.table.locator('th')).toContainText('Categoría');
  });

  // Lugares Compra: should have tipo + ubicacion + contacto + telefono
  test('lugares de compra debería tener campos tipo, ubicacion, contacto, telefono', async ({ authenticatedPage }) => {
    const maestrosPage = new MaestrosPage(authenticatedPage, {
      tipo: 'lugares-compras',
      singularName: 'Lugar',
    });

    await maestrosPage.gotoList();
    await maestrosPage.clickNuevo();
    await maestrosPage.expectFormModalVisible();

    // Verify correct fields exist
    await expect(maestrosPage.getFormField('Nombre')).toBeVisible();
    await expect(maestrosPage.getFormField('Tipo')).toBeVisible();
    await expect(maestrosPage.getFormField('Ubicación')).toBeVisible();
    await expect(maestrosPage.getFormField('Contacto')).toBeVisible();
    await expect(maestrosPage.getFormField('Teléfono')).toBeVisible();

    // Table should have correct columns
    await maestrosPage.cancelForm();
    await expect(maestrosPage.table.locator('th')).toContainText('Tipo');
    await expect(maestrosPage.table.locator('th')).toContainText('Ubicación');
    await expect(maestrosPage.table.locator('th')).toContainText('Contacto');
    await expect(maestrosPage.table.locator('th')).toContainText('Teléfono');
  });

  // Lugares Venta: same fields as Compra
  test('lugares de venta debería tener campos tipo, ubicacion, contacto, telefono', async ({ authenticatedPage }) => {
    const maestrosPage = new MaestrosPage(authenticatedPage, {
      tipo: 'lugares-ventas',
      singularName: 'Lugar',
    });

    await maestrosPage.gotoList();
    await maestrosPage.clickNuevo();
    await maestrosPage.expectFormModalVisible();

    // Verify correct fields exist
    await expect(maestrosPage.getFormField('Nombre')).toBeVisible();
    await expect(maestrosPage.getFormField('Tipo')).toBeVisible();
    await expect(maestrosPage.getFormField('Ubicación')).toBeVisible();
    await expect(maestrosPage.getFormField('Contacto')).toBeVisible();
    await expect(maestrosPage.getFormField('Teléfono')).toBeVisible();

    // Table should have correct columns
    await maestrosPage.cancelForm();
    await expect(maestrosPage.table.locator('th')).toContainText('Tipo');
    await expect(maestrosPage.table.locator('th')).toContainText('Ubicación');
    await expect(maestrosPage.table.locator('th')).toContainText('Contacto');
    await expect(maestrosPage.table.locator('th')).toContainText('Teléfono');
  });
});

// =============================================================================
// Regression — verify existing entities still work
// =============================================================================

test.describe('Maestros — Regresión (entidades existentes)', () => {
  // Veterinarios: nombre, especialidad, telefono, email
  test('veterinarios debería tener campos correctos', async ({ authenticatedPage }) => {
    const maestrosPage = new MaestrosPage(authenticatedPage, {
      tipo: 'veterinarios',
      singularName: 'Veterinario',
    });

    await maestrosPage.gotoList();
    await maestrosPage.clickNuevo();
    await maestrosPage.expectFormModalVisible();

    await expect(maestrosPage.getFormField('Nombre')).toBeVisible();
    await expect(maestrosPage.getFormField('Especialidad')).toBeVisible();
    await expect(maestrosPage.getFormField('Teléfono')).toBeVisible();
    await expect(maestrosPage.getFormField('Correo electrónico')).toBeVisible();

    await maestrosPage.cancelForm();
    await expect(maestrosPage.table.locator('th')).toContainText('Especialidad');
  });

  // Motivos Venta: nombre, descripcion
  test('motivos de venta debería tener campos correctos', async ({ authenticatedPage }) => {
    const maestrosPage = new MaestrosPage(authenticatedPage, {
      tipo: 'motivos-ventas',
      singularName: 'Motivo',
    });

    await maestrosPage.gotoList();
    await maestrosPage.clickNuevo();
    await maestrosPage.expectFormModalVisible();

    await expect(maestrosPage.getFormField('Nombre')).toBeVisible();
    await expect(maestrosPage.getFormField('Descripción')).toBeVisible();

    await maestrosPage.cancelForm();
    await expect(maestrosPage.table.locator('th')).toContainText('Nombre');
    await expect(maestrosPage.table.locator('th')).toContainText('Descripción');
  });

  // Causas Muerte: nombre, descripcion
  test('causas de muerte debería tener campos correctos', async ({ authenticatedPage }) => {
    const maestrosPage = new MaestrosPage(authenticatedPage, {
      tipo: 'causas-muerte',
      singularName: 'Causa',
    });

    await maestrosPage.gotoList();
    await maestrosPage.clickNuevo();
    await maestrosPage.expectFormModalVisible();

    await expect(maestrosPage.getFormField('Nombre')).toBeVisible();
    await expect(maestrosPage.getFormField('Descripción')).toBeVisible();

    await maestrosPage.cancelForm();
    await expect(maestrosPage.table.locator('th')).toContainText('Nombre');
    await expect(maestrosPage.table.locator('th')).toContainText('Descripción');
  });
});

// =============================================================================
// UI behavior — search, pagination, cancel
// =============================================================================

test.describe('Maestros — Comportamiento UI', () => {
  test('debería cancelar la creación sin guardar', async ({ authenticatedPage }) => {
    const maestrosPage = new MaestrosPage(authenticatedPage, {
      tipo: 'veterinarios',
      singularName: 'Veterinario',
    });

    await maestrosPage.gotoList();
    await maestrosPage.clickNuevo();
    await maestrosPage.expectFormModalVisible();

    // Fill some data
    await maestrosPage.fillField('Nombre', 'Should Not Be Saved');

    // Cancel
    await maestrosPage.cancelForm();
    await maestrosPage.expectFormModalHidden();

    // Verify item was NOT created
    await expect(maestrosPage.page.getByText('Should Not Be Saved')).not.toBeVisible();
  });

  test('debería cancelar la eliminación al presionar cancelar', async ({ authenticatedPage }) => {
    const maestrosPage = new MaestrosPage(authenticatedPage, {
      tipo: 'veterinarios',
      singularName: 'Veterinario',
    });

    await maestrosPage.gotoList();
    await maestrosPage.expectListPage();

    const existingName = MAESTROS_ENTITIES.veterinarios.existingName;

    // Click delete
    await maestrosPage.clickDeleteEntity(existingName);
    await maestrosPage.expectDeleteModalVisible();

    // Cancel
    await maestrosPage.cancelDelete();
    await maestrosPage.expectDeleteModalHidden();

    // Item should still be in table
    await maestrosPage.expectEntityInTable(existingName);
  });

  test('debería mostrar estado vacío cuando no hay resultados de búsqueda', async ({ authenticatedPage }) => {
    const maestrosPage = new MaestrosPage(authenticatedPage, {
      tipo: 'veterinarios',
      singularName: 'Veterinario',
    });

    await maestrosPage.gotoList();
    await maestrosPage.expectListPage();

    // Search for something that doesn't exist
    await maestrosPage.searchByName('xyz-no-existe-123');

    // Should show empty state
    await expect(maestrosPage.page.getByText(/no hay registros/i)).toBeVisible({ timeout: 5000 });
  });
});

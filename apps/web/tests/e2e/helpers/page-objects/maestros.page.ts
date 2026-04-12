// apps/web/tests/e2e/helpers/page-objects/maestros.page.ts
/**
 * MaestrosPage — Generic Page Object for all Maestro entity CRUD flows.
 *
 * All 8 maestro entities (veterinarios, propietarios, hierros, diagnosticos,
 * motivos-ventas, causas-muerte, lugares-compras, lugares-ventas) share the
 * same MaestroEntityPage component. This Page Object abstracts the common
 * interactions: list, create via modal, edit via modal, delete via modal.
 *
 * Usage:
 *   import { MaestrosPage } from './helpers/page-objects/maestros.page';
 *
 *   test('create propietario', async ({ authenticatedPage }) => {
 *     const page = new MaestrosPage(authenticatedPage, 'propietarios', 'Propietario');
 *     await page.gotoList();
 *     await page.clickNuevo();
 *     await page.fillField('Nombre', 'Test Owner');
 *     await page.submitForm();
 *     await page.expectSuccessToast('Propietario creado correctamente');
 *   });
 */

import { type Page, type Locator, expect } from '@playwright/test';

export type MaestroEntityConfig = {
  /** URL segment, e.g. 'propietarios', 'lugares-compras' */
  tipo: string;
  /** Singular name for UI assertions, e.g. 'Propietario', 'Lugar' */
  singularName: string;
};

export class MaestrosPage {
  readonly page: Page;
  readonly config: MaestroEntityConfig;
  readonly baseUrl: string;

  constructor(page: Page, config: MaestroEntityConfig) {
    this.page = page;
    this.config = config;
    this.baseUrl = `/dashboard/maestros/${config.tipo}`;
  }

  // ===========================================================================
  // Navigation
  // ===========================================================================

  /** Navigate to maestros list page */
  async gotoList(): Promise<void> {
    await this.page.goto(this.baseUrl);
    await this.page.waitForLoadState('networkidle');
  }

  // ===========================================================================
  // List page locators
  // ===========================================================================

  /** Get the main heading (h1) */
  get heading(): Locator {
    return this.page.locator('h1').first();
  }

  /** Get the maestros table */
  get table(): Locator {
    return this.page.locator('table').first();
  }

  /** Get "Nuevo {Entity}" button */
  get nuevoButton(): Locator {
    return this.page.getByRole('button', { name: new RegExp(`nuevo\\s+${this.config.singularName}`, 'i') });
  }

  /** Get search input */
  get searchInput(): Locator {
    return this.page.getByPlaceholder(/buscar/i);
  }

  /** Get pagination info text */
  get paginationInfo(): Locator {
    return this.page.locator('text=/mostrando.*de.*registros/i');
  }

  /** Get "Anterior" pagination button */
  get prevPageButton(): Locator {
    return this.page.getByRole('button', { name: /anterior/i });
  }

  /** Get "Siguiente" pagination button */
  get nextPageButton(): Locator {
    return this.page.getByRole('button', { name: /siguiente/i });
  }

  // ===========================================================================
  // List page interactions
  // ===========================================================================

  /** Click "Nuevo {Entity}" button */
  async clickNuevo(): Promise<void> {
    await this.nuevoButton.click();
  }

  /** Search for an entity by name */
  async searchByName(query: string): Promise<void> {
    await this.searchInput.fill(query);
    // Trigger search by pressing Enter or waiting for debounce
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  /** Get a row in the table by entity name */
  getTableRow(name: string): Locator {
    return this.table.locator('tr').filter({ hasText: name }).first();
  }

  /** Check if entity appears in the table */
  async entityExistsInTable(name: string): Promise<boolean> {
    const row = this.getTableRow(name);
    return row.isVisible().catch(() => false);
  }

  /** Click the edit button for an entity in the table */
  async clickEditEntity(name: string): Promise<void> {
    const row = this.getTableRow(name);
    await row.getByRole('button', { name: /editar/i }).click();
  }

  /** Click the delete button for an entity in the table */
  async clickDeleteEntity(name: string): Promise<void> {
    const row = this.getTableRow(name);
    await row.getByRole('button', { name: /eliminar/i }).click();
  }

  // ===========================================================================
  // Form modal interactions
  // ===========================================================================

  /** Get the form modal (dialog) */
  get formModal(): Locator {
    return this.page.getByRole('dialog').filter({
      hasText: new RegExp(`(nuevo|editar)\\s+${this.config.singularName}`, 'i'),
    }).first();
  }

  /** Get a form field by its label */
  getFormField(label: string): Locator {
    return this.formModal.getByLabel(new RegExp(label, 'i'));
  }

  /** Fill a form field by label */
  async fillField(label: string, value: string): Promise<void> {
    const field = this.getFormField(label);
    // For textarea vs input, both support fill()
    await field.fill(value);
  }

  /** Fill multiple fields at once */
  async fillFields(fields: Record<string, string>): Promise<void> {
    for (const [label, value] of Object.entries(fields)) {
      await this.fillField(label, value);
    }
  }

  /** Get submit button in form */
  get submitButton(): Locator {
    return this.formModal.getByRole('button', { name: /guardar/i });
  }

  /** Get cancel button in form */
  get cancelButton(): Locator {
    return this.formModal.getByRole('button', { name: /cancelar/i });
  }

  /** Submit the form */
  async submitForm(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /** Cancel the form */
  async cancelForm(): Promise<void> {
    await this.cancelButton.click();
  }

  // ===========================================================================
  // Delete modal interactions
  // ===========================================================================

  /** Get the delete confirmation dialog */
  get deleteModal(): Locator {
    return this.page.getByRole('dialog').filter({
      hasText: /eliminar|confirmar/i,
    }).first();
  }

  /** Get confirm delete button */
  get confirmDeleteButton(): Locator {
    return this.deleteModal.getByRole('button', { name: /confirmar|eliminar|sí/i });
  }

  /** Confirm deletion */
  async confirmDelete(): Promise<void> {
    await this.confirmDeleteButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /** Cancel deletion */
  async cancelDelete(): Promise<void> {
    const cancelBtn = this.deleteModal.getByRole('button', { name: /cancelar/i });
    await cancelBtn.click();
  }

  // ===========================================================================
  // Toast / notification
  // ===========================================================================

  /** Get toast notification */
  get toast(): Locator {
    return this.page.locator('[class*="toast"], [role="alert"], [class*="notification"]').first();
  }

  /** Expect a success toast with specific message */
  async expectSuccessToast(message: string): Promise<void> {
    await expect(this.page.getByText(message)).toBeVisible({ timeout: 5000 });
  }

  // ===========================================================================
  // Assertions
  // ===========================================================================

  /** Assert list page loaded with correct heading */
  async expectListPage(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 5000 });
    await expect(this.table).toBeVisible();
  }

  /** Assert entity is visible in table */
  async expectEntityInTable(name: string): Promise<void> {
    const row = this.getTableRow(name);
    await expect(row).toBeVisible();
  }

  /** Assert entity is NOT visible in table */
  async expectEntityNotInTable(name: string): Promise<void> {
    const row = this.getTableRow(name);
    await expect(row).not.toBeVisible();
  }

  /** Assert form modal is visible */
  async expectFormModalVisible(): Promise<void> {
    await expect(this.formModal).toBeVisible({ timeout: 3000 });
  }

  /** Assert form modal is hidden */
  async expectFormModalHidden(): Promise<void> {
    await expect(this.formModal).not.toBeVisible();
  }

  /** Assert delete modal is visible */
  async expectDeleteModalVisible(): Promise<void> {
    await expect(this.deleteModal).toBeVisible({ timeout: 3000 });
  }

  /** Assert delete modal is hidden */
  async expectDeleteModalHidden(): Promise<void> {
    await expect(this.deleteModal).not.toBeVisible();
  }
}

// Default export for convenience
export default MaestrosPage;

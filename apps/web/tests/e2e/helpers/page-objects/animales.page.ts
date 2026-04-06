// apps/web/tests/e2e/helpers/page-objects/animales.page.ts
/**
 * AnimalesPage — Page Object for Animales CRUD flows.
 *
 * Encapsulates all interactions with the Animales list, detail,
 * create, and edit pages. Uses user-facing locators (labels, roles, text)
 * rather than CSS selectors for maintainability.
 *
 * Usage:
 *   import { AnimalesPage } from './helpers/page-objects/animales.page';
 *
 *   test('create animal', async ({ authenticatedPage }) => {
 *     const animalesPage = new AnimalesPage(authenticatedPage);
 *     await animalesPage.gotoList();
 *     await animalesPage.clickNuevoAnimal();
 *     await animalesPage.fillForm({ codigo: 'GAN-NEW', nombre: 'New Animal' });
 *     await animalesPage.submitForm();
 *     await animalesPage.expectToBeOnDetailPage('GAN-NEW');
 *   });
 */

import { type Page, type Locator, expect } from '@playwright/test';
import { TEST_ANIMAL, NEW_ANIMAL_DATA, UI_STRINGS } from '../test-data';

export type AnimalFormData = {
  codigo?: string;
  nombre?: string;
  fechaNacimiento?: string;
  sexoKey?: number;
  tipoIngresoId?: number;
  configRazasId?: number;
  potreroId?: number;
};

export class AnimalesPage {
  readonly page: Page;

  // Base URL forAnimales section
  readonly baseUrl = '/dashboard/animales';

  constructor(page: Page) {
    this.page = page;
  }

  // ===========================================================================
  // Navigation
  // ===========================================================================

  /** Navigate to animales list page */
  async gotoList(): Promise<void> {
    await this.page.goto(this.baseUrl);
    await this.page.waitForLoadState('networkidle');
  }

  /** Navigate to create new animal page */
  async gotoCreate(): Promise<void> {
    await this.gotoList();
    await this.clickNuevoAnimal();
    await this.page.waitForURL(`${this.baseUrl}/nuevo`);
  }

  /** Navigate to animal detail page */
  async gotoDetail(id: number | string = TEST_ANIMAL.id): Promise<void> {
    await this.page.goto(`${this.baseUrl}/${id}`);
    await this.page.waitForLoadState('networkidle');
  }

  /** Navigate to edit animal page */
  async gotoEdit(id: number | string = TEST_ANIMAL.id): Promise<void> {
    await this.page.goto(`${this.baseUrl}/${id}/editar`);
    await this.page.waitForLoadState('networkidle');
  }

  // ===========================================================================
  // List page interactions
  // ===========================================================================

  /** Get the main heading */
  get heading(): Locator {
    return this.page.locator('h1').first();
  }

  /** Get the animales table */
  get table(): Locator {
    return this.page.locator('table').first();
  }

  /** Get "Nuevo Animal" button */
  get nuevoAnimalButton(): Locator {
    return this.page.getByRole('button', { name: UI_STRINGS.animales.nuevoAnimal });
  }

  /** Get search input */
  get searchInput(): Locator {
    return this.page.getByPlaceholder(UI_STRINGS.animales.buscarPlaceholder);
  }

  /**
   * Click "Nuevo Animal" button
   */
  async clickNuevoAnimal(): Promise<void> {
    await this.nuevoAnimalButton.click();
  }

  /**
   * Search for animal by code or name
   */
  async searchAnimal(query: string): Promise<void> {
    await this.searchInput.fill(query);
    // Wait for results to update
    await this.page.waitForResponse(
      (resp) => resp.url().includes('/api/v1/animales') && resp.status() === 200,
    );
  }

  /**
   * Get a row in the table by animal code
   */
  getTableRow(codigo: string): Locator {
    return this.table.locator('tr').filter({ hasText: codigo }).first();
  }

  /**
   * Click the edit button for an animal in the table
   */
  async clickEditAnimal(codigo: string): Promise<void> {
    const row = this.getTableRow(codigo);
    await row.getByRole('button', { name: /editar/i }).click();
  }

  /**
   * Click the delete button for an animal in the table
   */
  async clickDeleteAnimal(codigo: string): Promise<void> {
    const row = this.getTableRow(codigo);
    await row.getByRole('button', { name: /eliminar/i }).click();
  }

  /**
   * Select an animal checkbox in the table
   */
  async selectAnimalCheckbox(codigo: string): Promise<void> {
    const row = this.getTableRow(codigo);
    const checkbox = row.locator('input[type="checkbox"]');
    await checkbox.check();
  }

  /**
   * Check if animal appears in the table
   */
  async animalExistsInTable(codigo: string): Promise<boolean> {
    const row = this.getTableRow(codigo);
    return row.isVisible().catch(() => false);
  }

  // ===========================================================================
  // Detail page interactions
  // ===========================================================================

  /**
   * Get animal code heading on detail page
   */
  get detailCodeHeading(): Locator {
    return this.page.locator('h1').filter({ hasText: TEST_ANIMAL.codigo }).first();
  }

  /**
   * Check if detail page shows correct animal
   */
  async expectDetailPageShows(codigo: string): Promise<void> {
    await expect(this.page.locator('h1')).toContainText(codigo);
  }

  // ===========================================================================
  // Form interactions (create/edit)
  // ===========================================================================

  /** Get form element */
  get form(): Locator {
    return this.page.locator('form');
  }

  /** Get codigo input */
  get codigoInput(): Locator {
    return this.page.getByLabel(/código/i).first();
  }

  /** Get nombre input */
  get nombreInput(): Locator {
    return this.page.getByLabel(/nombre/i).first();
  }

  /** Get fecha nacimiento input */
  get fechaNacimientoInput(): Locator {
    return this.page.getByLabel(/fecha.*nacimiento/i).first();
  }

  /** Get submit button */
  get submitButton(): Locator {
    return this.page.getByRole('button', { name: /(guardar|crear|actualizar)/i }).first();
  }

  /** Get cancel button */
  get cancelButton(): Locator {
    return this.page.getByRole('button', { name: /cancelar/i }).first();
  }

  /**
   * Fill animal form with data
   */
  async fillForm(data: AnimalFormData): Promise<void> {
    if (data.codigo !== undefined) {
      await this.codigoInput.fill(data.codigo);
    }
    if (data.nombre !== undefined) {
      await this.nombreInput.fill(data.nombre);
    }
    if (data.fechaNacimiento !== undefined) {
      await this.fechaNacimientoInput.fill(data.fechaNacimiento);
    }
    // Select dropdowns would be handled by label selectors
  }

  /**
   * Submit the form
   */
  async submitForm(): Promise<void> {
    await this.submitButton.click();
    // Wait for redirect or success
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Cancel the form
   */
  async cancelForm(): Promise<void> {
    await this.cancelButton.click();
  }

  // ===========================================================================
  // Assertions
  // ===========================================================================

  /**
   * Assert list page loaded with heading
   */
  async expectListPage(): Promise<void> {
    await expect(this.heading).toContainText('Animales', { ignoreCase: true });
    await expect(this.table).toBeVisible();
  }

  /**
   * Assert animal is visible in table
   */
  async expectAnimalInTable(codigo: string, nombre?: string): Promise<void> {
    const row = this.getTableRow(codigo);
    await expect(row).toBeVisible();
    if (nombre) {
      await expect(row).toContainText(nombre);
    }
  }

  /**
   * Assert animal is NOT visible in table
   */
  async expectAnimalNotInTable(codigo: string): Promise<void> {
    const row = this.getTableRow(codigo);
    await expect(row).not.toBeVisible();
  }

  /**
   * Assert redirect to detail page after create
   */
  async expectRedirectToDetail(codigo: string): Promise<void> {
    await this.page.waitForURL(`${this.baseUrl}/${codigo}`, { timeout: 5000 }).catch(() => {
      // Fallback: just check URL contains the codigo
      expect(this.page.url()).toContain(codigo);
    });
  }

  /**
   * Assert form shows validation error
   */
  async expectValidationError(message?: RegExp): Promise<void> {
    const errorLocator = this.form.locator('[class*="error"], [class*="invalid"]');
    if (message) {
      await expect(errorLocator.first()).toContainText(message);
    } else {
      await expect(errorLocator.first()).toBeVisible();
    }
  }
}

// Default export for convenience
export default AnimalesPage;

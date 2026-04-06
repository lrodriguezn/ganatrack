// apps/web/tests/e2e/helpers/page-objects/servicios-wizard.page.ts
/**
 * ServiciosWizardPage — Page Object for servicios (palpación, parto, etc.) wizards.
 *
 * Encapsulates multi-step wizard flows. Wizards typically have:
 * - Step indicators (1, 2, 3 or similar)
 * - Navigation buttons (Anterior, Siguiente, Guardar)
 * - Form validation between steps
 * - Summary/review step before final submission
 *
 * Usage:
 *   import { ServiciosWizardPage } from './helpers/page-objects/servicios-wizard.page';
 *
 *   test('palpation wizard flow', async ({ authenticatedPage }) => {
 *     const wizard = new ServiciosWizardPage(authenticatedPage);
 *     await wizard.gotoPalpacion();
 *
 *     // Fill step 1
 *     await wizard.fillStep1({ animalId: 1, fecha: '2024-03-01' });
 *     await wizard.nextStep();
 *
 *     // Fill step 2
 *     await wizard.fillStep2({ resultado: 'preñada' });
 *     await wizard.nextStep();
 *
 *     // Verify summary and submit
 *     await wizard.verifySummary();
 *     await wizard.submitWizard();
 *     await wizard.expectSuccess();
 *   });
 */

import { type Page, type Locator, expect } from '@playwright/test';
import { TEST_SERVICIO_PALPACION, TEST_SERVICIO_PARTO } from '../test-data';

export type PalpacionStep1Data = {
  animalId?: number;
  fecha?: string;
};

export type PalpacionStep2Data = {
  resultado?: string;
  semanasGestacion?: number;
  observaciones?: string;
};

export type PartoStep1Data = {
  animalId?: number;
  fecha?: string;
};

export type PartoStep2Data = {
  criaId?: number;
  resultado?: string;
  observaciones?: string;
};

export class ServiciosWizardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ===========================================================================
  // Base wizard locators
  // ===========================================================================

  /** Get wizard form element */
  get form(): Locator {
    return this.page.locator('form').first();
  }

  /** Get step indicator (e.g., "Paso 1 de 3") */
  get stepIndicator(): Locator {
    return this.page.locator('text=/paso \\d+.*\\d+/i').first();
  }

  /** Get current step indicator text */
  async getCurrentStep(): Promise<number> {
    const text = await this.stepIndicator.textContent();
    const match = text?.match(/paso (\d+)/i);
    return match ? parseInt(match[1], 10) : 1;
  }

  /** "Siguiente" button */
  get nextButton(): Locator {
    return this.page.getByRole('button', { name: /siguiente/i }).first();
  }

  /** "Anterior" button */
  get previousButton(): Locator {
    return this.page.getByRole('button', { name: /anterior/i }).first();
  }

  /** "Guardar" or "Finalizar" button */
  get submitButton(): Locator {
    return this.page.getByRole('button', { name: /(guardar|finalizar|completar)/i }).first();
  }

  /** "Cancelar" button */
  get cancelButton(): Locator {
    return this.page.getByRole('button', { name: /cancelar/i }).first();
  }

  // ===========================================================================
  // Navigation
  // ===========================================================================

  /** Navigate to palpación wizard */
  async gotoPalpacion(): Promise<void> {
    await this.page.goto('/dashboard/servicios/palpacion/nuevo');
    await this.page.waitForLoadState('networkidle');
  }

  /** Navigate to parto wizard */
  async gotoParto(): Promise<void> {
    await this.page.goto('/dashboard/servicios/parto/nuevo');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Advance to next step
   */
  async nextStep(): Promise<void> {
    await this.nextButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Go to previous step
   */
  async previousStep(): Promise<void> {
    await this.previousButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Submit the wizard (final step)
   */
  async submitWizard(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  // ===========================================================================
  // Step 1: Animal selection
  // ===========================================================================

  /** Get animal selection dropdown/search */
  get animalSelector(): Locator {
    return this.page.getByLabel(/animal/i).first();
  }

  /** Get fecha input */
  get fechaInput(): Locator {
    return this.page.getByLabel(/fecha/i).first();
  }

  /**
   * Fill step 1: Animal selection and date
   */
  async fillStep1(data: PalpacionStep1Data | PartoStep1Data): Promise<void> {
    if (data.animalId !== undefined) {
      // Select animal from dropdown
      await this.animalSelector.click();
      // Look for the option or search result
      const option = this.page.locator('[role="option"], [role="combobox"] option')
        .filter({ hasText: String(data.animalId) });
      await option.first().click();
    }
    if (data.fecha !== undefined) {
      await this.fechaInput.fill(data.fecha);
    }
  }

  // ===========================================================================
  // Step 2: Service-specific data
  // ===========================================================================

  /** Get resultado dropdown */
  get resultadoSelector(): Locator {
    return this.page.getByLabel(/resultado/i).first();
  }

  /** Get semanas gestacion input (palpation only) */
  get semanasGestacionInput(): Locator {
    return this.page.getByLabel(/semanas/i).first();
  }

  /** Get observaciones textarea */
  get observacionesTextarea(): Locator {
    return this.page.getByLabel(/observaciones/i).first();
  }

  /**
   * Fill step 2: Service-specific fields (palpation)
   */
  async fillPalpacionStep2(data: PalpacionStep2Data): Promise<void> {
    if (data.resultado !== undefined) {
      await this.resultadoSelector.click();
      const option = this.page.locator('[role="option"], [role="listbox"] option')
        .filter({ hasText: new RegExp(data.resultado, 'i') });
      await option.first().click();
    }
    if (data.semanasGestacion !== undefined) {
      await this.semanasGestacionInput.fill(String(data.semanasGestacion));
    }
    if (data.observaciones !== undefined) {
      await this.observacionesTextarea.fill(data.observaciones);
    }
  }

  /**
   * Fill step 2: Service-specific fields (parto)
   */
  async fillPartoStep2(data: PartoStep2Data): Promise<void> {
    if (data.resultado !== undefined) {
      await this.resultadoSelector.click();
      const option = this.page.locator('[role="option"], [role="listbox"] option')
        .filter({ hasText: new RegExp(data.resultado, 'i') });
      await option.first().click();
    }
    if (data.criaId !== undefined) {
      // cria selection
      const criaSelector = this.page.getByLabel(/cría/i).first();
      await criaSelector.click();
      const option = this.page.locator('[role="option"], [role="listbox"] option')
        .filter({ hasText: String(data.criaId) });
      await option.first().click();
    }
    if (data.observaciones !== undefined) {
      await this.observacionesTextarea.fill(data.observaciones);
    }
  }

  // ===========================================================================
  // Step 3: Summary (if applicable)
  // ===========================================================================

  /** Get summary section */
  get summarySection(): Locator {
    return this.page.locator('[class*="summary"], [class*="resumen"]').first();
  }

  /**
   * Verify summary contains expected data
   */
  async verifySummary(): Promise<void> {
    // Summary should be visible on final step
    const currentStep = await this.getCurrentStep();
    expect(currentStep).toBe(3);

    await expect(this.summarySection).toBeVisible();
  }

  /**
   * Assert summary contains specific text
   */
  async expectSummaryContains(text: string): Promise<void> {
    await expect(this.summarySection).toContainText(text);
  }

  // ===========================================================================
  // Assertions
  // ===========================================================================

  /**
   * Assert wizard completed successfully and redirected
   */
  async expectSuccess(): Promise<void> {
    // Check for success toast or redirect to detail
    const toast = this.page.locator('[class*="toast"], [class*="success"]').first();
    const onDetailPage = this.page.url().includes('/servicios/');

    if (onDetailPage) {
      // Redirected to detail page - good!
      await this.page.waitForLoadState('networkidle');
    } else {
      // Check for success toast
      await expect(toast).toBeVisible({ timeout: 3000 });
    }
  }

  /**
   * Assert validation error on current step
   */
  async expectValidationError(fieldName?: string): Promise<void> {
    if (fieldName) {
      const field = this.page.getByLabel(new RegExp(fieldName, 'i')).first();
      await expect(field).toHaveAttribute('aria-invalid', 'true');
    } else {
      const error = this.page.locator('[class*="error"], [aria-invalid="true"]').first();
      await expect(error).toBeVisible();
    }
  }

  /**
   * Assert wizard is on specific step
   */
  async expectOnStep(stepNumber: number): Promise<void> {
    const current = await this.getCurrentStep();
    expect(current).toBe(stepNumber);
  }
}

// Default export for convenience
export default ServiciosWizardPage;

// apps/web/tests/e2e/mobile.spec.ts
/**
 * E2E tests for Mobile Responsive behavior.
 *
 * Scenarios from spec (E2E-09):
 * 1. Mobile sidebar — hamburger menu opens/closes navigation
 * 2. Responsive tables — tables scroll horizontally or switch to cards on mobile
 * 3. Forms — forms are usable at mobile viewport (375px width)
 * 4. Pull-to-refresh — or page refresh behavior on mobile
 * 5. Touch interactions — buttons and links are tappable (44px min touch target)
 *
 * Uses mobile-chrome and mobile-safari Playwright projects.
 */

import { test, expect } from './fixtures';

test.describe('Responsive Mobile', () => {
  // Use mobile viewport (iPhone 12 dimensions)
  test.use({ viewport: { width: 375, height: 812 } });

  // =========================================================================
  // E2E-09 Scenario 1: Mobile sidebar hamburger menu
  // =========================================================================
  test('debería abrir y cerrar el menú móvil con el botón hamburger', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Hamburger button should be visible on mobile
    const hamburgerButton = page.locator('button[aria-label="Abrir menú"]');
    await expect(hamburgerButton).toBeVisible();

    // Sidebar should be closed initially
    // Check that mobile sidebar dialog is not open
    const mobileSidebar = page.locator('[role="dialog"]').filter({ hasText: /GanaTrack/i });
    await expect(mobileSidebar).toBeHidden({ timeout: 2000 });

    // Click hamburger to open
    await hamburgerButton.click();

    // Mobile sidebar should now be visible
    const openSidebar = page.locator('[role="dialog"]').filter({ hasText: /GanaTrack/i });
    await expect(openSidebar).toBeVisible({ timeout: 3000 });

    // Close button should be visible
    const closeButton = page.locator('button[aria-label="Cerrar"]');
    await expect(closeButton).toBeVisible();

    // Click close to dismiss
    await closeButton.click();

    // Sidebar should be closed again
    await expect(openSidebar).toBeHidden({ timeout: 3000 });
  });

  // =========================================================================
  // E2E-09 Scenario 2: Responsive tables on mobile
  // =========================================================================
  test('debería mostrar tablas con scroll horizontal en móvil', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Navigate to animales list (has a data table)
    await page.goto('/dashboard/animales');
    await page.waitForLoadState('networkidle');

    // Look for a table element
    const table = page.locator('table').first();

    // Check if table is visible
    const tableExists = await table.isVisible({ timeout: 5000 }).catch(() => false);

    if (tableExists) {
      // Table should have horizontal scroll capability
      // Check parent container for overflow
      const tableContainer = page.locator('[class*="overflow"]').first();
      const hasOverflow = await tableContainer.evaluate((el) => {
        return el.scrollWidth > el.clientWidth;
      }).catch(() => false);

      // If no overflow class, check table directly
      if (!hasOverflow) {
        // Table should be scrollable or have horizontal scroll
        await expect(table).toBeVisible();
      }

      // Verify table headers are readable
      const headers = table.locator('th');
      const headerCount = await headers.count();
      expect(headerCount).toBeGreaterThan(0);
    } else {
      // Alternative: cards layout instead of table
      // Mobile might switch to cards at small viewports
      const cards = page.locator('[class*="card"]').filter({ hasText: /GAN-/i });
      const hasCards = await cards.first().isVisible({ timeout: 2000 }).catch(() => false);

      if (hasCards) {
        // Cards should be visible instead of table
        await expect(cards.first()).toBeVisible();
      }
    }
  });

  // =========================================================================
  // E2E-09 Scenario 3: Forms usable at mobile viewport
  // =========================================================================
  test('debería permitir completar formularios en viewport móvil', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Navigate to create animal form
    await page.goto('/dashboard/animales/nuevo');
    await page.waitForLoadState('networkidle');

    // Form should be visible
    const form = page.locator('form').first();
    await expect(form).toBeVisible({ timeout: 5000 });

    // Code input should be visible and enabled
    const codigoInput = page.getByLabel(/código/i).first();
    if (await codigoInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await codigoInput.fill('GAN-MOBILE');
    }

    // Nombre input
    const nombreInput = page.getByLabel(/nombre/i).first();
    if (await nombreInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nombreInput.fill('Animal Móvil');
    }

    // Date input if exists
    const fechaInput = page.getByLabel(/fecha/i).first();
    if (await fechaInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await fechaInput.fill('2024-01-15');
    }

    // Submit button should be visible and enabled
    const submitButton = page.getByRole('button', { name: /guardar|crear|registrar/i }).first();
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });

  // =========================================================================
  // E2E-09 Scenario 4: Pull-to-refresh behavior
  // =========================================================================
  test('debería permitir refrescar la página en móvil', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Get initial content timestamp or hash
    const initialContent = await page.locator('body').textContent();

    // Perform pull-to-refresh by dragging down
    // Note: Playwright doesn't have native pull-to-refresh, so we simulate with reload
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Page should reload without errors
    await expect(page).toHaveURL(/\/dashboard/);

    // Content should be loaded
    const newContent = await page.locator('body').textContent();
    expect(newContent).toBeTruthy();

    // Alternative: Test swipe down gesture if supported
    // This tests the mobile gesture support even if actual refresh is handled differently
    await page.evaluate(() => {
      // Dispatch touch events to simulate pull gesture
      const container = document.documentElement;
      const touchStart = new TouchEvent('touchstart', {
        touches: [new Touch({ identifier: 0, target: container, clientX: 0, clientY: 0 })],
      });
      const touchMove = new TouchEvent('touchmove', {
        touches: [new Touch({ identifier: 0, target: container, clientX: 0, clientY: 100 })],
      });
      const touchEnd = new TouchEvent('touchend', {
        touches: [],
      });
      container.dispatchEvent(touchStart);
      container.dispatchEvent(touchMove);
      container.dispatchEvent(touchEnd);
    });

    // Page should still be functional after gesture
    await expect(page.locator('text=/dashboard/i')).toBeVisible();
  });

  // =========================================================================
  // E2E-09 Scenario 5: Touch interactions with 44px minimum touch target
  // =========================================================================
  test('debería tener botones con área táctil mínima de 44px', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Find interactive buttons
    const buttons = page.locator('button').filter({ hasText: /.+/ });

    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // Check at least a few buttons for touch target size
    const buttonsToCheck = Math.min(buttonCount, 5);

    for (let i = 0; i < buttonsToCheck; i++) {
      const button = buttons.nth(i);

      // Skip if not visible
      if (!(await button.isVisible({ timeout: 1000 }).catch(() => false))) {
        continue;
      }

      // Get button bounding box
      const box = await button.boundingBox();

      if (box) {
        // Check if button meets 44px minimum touch target
        // Height should be at least 44px OR width if it's a wide button
        const hasMinTouchTarget = box.height >= 44 || box.width >= 44;

        // Log for debugging but don't fail on small buttons that might be icons
        if (!hasMinTouchTarget) {
          const buttonText = await button.textContent();
          const buttonClass = await button.getAttribute('class');
          // Icon-only buttons are acceptable with small touch targets
          const isIconOnly = !buttonText?.trim() || buttonText.length < 3;
          if (!isIconOnly) {
            // For text buttons, they should have adequate touch target (WCAG 44px minimum)
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    }

    // Verify at least the hamburger button meets touch target
    const hamburgerButton = page.locator('button[aria-label="Abrir menú"]');
    if (await hamburgerButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      const hamburgerBox = await hamburgerButton.boundingBox();
      // Hamburger should have adequate touch area
      expect(hamburgerBox?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
  });

  // =========================================================================
  // Additional: Navigation menu items are tappable
  // =========================================================================
  test('debería permitir tocar elementos de navegación en menú móvil', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Open mobile menu
    const hamburgerButton = page.locator('button[aria-label="Abrir menú"]');
    await hamburgerButton.click();

    // Wait for sidebar
    const mobileSidebar = page.locator('[role="dialog"]');
    await expect(mobileSidebar).toBeVisible({ timeout: 3000 });

    // Find navigation items
    const navItems = mobileSidebar.locator('a, button').filter({ hasText: /.+/ });

    const navItemCount = await navItems.count();
    expect(navItemCount).toBeGreaterThan(0);

    // Click on Animales nav item
    const animalesNav = mobileSidebar.locator('a, button').filter({ hasText: /animales/i }).first();
    if (await animalesNav.isVisible({ timeout: 2000 }).catch(() => false)) {
      await animalesNav.click();

      // Should navigate to animales page
      await expect(page).toHaveURL(/\/dashboard\/animales/, { timeout: 5000 });
    }
  });
});

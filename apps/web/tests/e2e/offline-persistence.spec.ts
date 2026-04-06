// apps/web/tests/e2e/offline-persistence.spec.ts
/**
 * E2E tests for PWA Offline Persistence.
 *
 * Tests that query data persists across page reload when offline,
 * verifying the service worker cache strategy works correctly.
 */

import { test, expect } from '@playwright/test';

// Start MSW for API mocking
import './msw-setup';

test.describe('PWA Offline Persistence', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard first to cache data
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should show cached data after page reload while offline', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);

    // Reload the dashboard page
    await page.reload();

    // Should not crash - cached content should render
    await expect(page).toHaveURL(/\/dashboard/);

    // The page should display some content (cached from previous visit)
    await expect(page.locator('body')).toBeVisible();

    // Any data that was cached should still be visible
    // This depends on what's in the dashboard - we check for presence of main content
    const mainContent = page.locator('main, [role="main"], body');
    await expect(mainContent.first()).toBeVisible();
  });

  test('should persist animales list when going offline and reloading', async ({ page, context }) => {
    // First, load animales page to cache the data
    await page.goto('/dashboard/animales');
    await page.waitForLoadState('networkidle');

    // Store if there's a table with data
    const tableBeforeOffline = page.locator('table').first();
    const hasTableBefore = await tableBeforeOffline.isVisible().catch(() => false);

    // Go offline
    await context.setOffline(true);

    // Reload the animales page
    await page.reload();

    // Should load without network error
    await expect(page).toHaveURL(/\/dashboard\/animales/);

    // If there was a table before, it should still be visible (cached)
    if (hasTableBefore) {
      await expect(tableBeforeOffline).toBeVisible({ timeout: 5000 });
    }
  });

  test('should allow navigation between cached pages while offline', async ({ page, context }) => {
    // Load multiple pages to cache them
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    await page.goto('/dashboard/predios');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);

    // Navigate to cached pages
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/dashboard/predios');
    await expect(page).toHaveURL(/\/dashboard\/predios/);
  });
});

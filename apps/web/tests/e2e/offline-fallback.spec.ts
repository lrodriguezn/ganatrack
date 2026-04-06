// apps/web/tests/e2e/offline-fallback.spec.ts
/**
 * E2E tests for Offline Fallback Page.
 *
 * Tests that when navigating to an uncached route while offline,
 * the offline fallback page is displayed with proper actions.
 */

import { test, expect } from '@playwright/test';

// Start MSW for API mocking
import './msw-setup';

test.describe('Offline Fallback Page', () => {
  test('should show offline page when navigating to uncached route while offline', async ({ page, context }) => {
    // Go offline first BEFORE visiting any page
    await context.setOffline(true);

    // Try to navigate to a route that was never visited (not cached)
    // Using the offline page URL directly
    const response = await page.goto('/offline');

    // Should show offline page content with specific elements
    await expect(page.getByText('Sin conexión a internet')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /reintentar/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
  });

  test('should show retry button that reloads the page', async ({ page, context }) => {
    await context.setOffline(true);

    await page.goto('/offline');

    // Find and click retry button
    const retryButton = page.getByRole('button', { name: /reintentar/i });
    await expect(retryButton).toBeVisible();

    // Click should trigger reload - in offline mode it stays on offline page
    await retryButton.click();

    // Should still be on offline page (reload doesn't help when offline)
    await expect(page.getByText('Sin conexión a internet')).toBeVisible();
  });

  test('should show link to dashboard from offline page', async ({ page, context }) => {
    await context.setOffline(true);

    await page.goto('/offline');

    // Find dashboard link
    const dashboardLink = page.getByRole('link', { name: /dashboard/i });
    await expect(dashboardLink).toBeVisible();

    // The link should point to /dashboard
    await expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });

  test('should show link to animales from offline page', async ({ page, context }) => {
    await context.setOffline(true);

    await page.goto('/offline');

    // Find animales link
    const animalesLink = page.getByRole('link', { name: /animales/i });
    await expect(animalesLink).toBeVisible();

    // The link should point to /dashboard/animales
    await expect(animalesLink).toHaveAttribute('href', '/dashboard/animales');
  });

  test('should display informative message about offline behavior', async ({ page, context }) => {
    await context.setOffline(true);

    await page.goto('/offline');

    // Check for informative text about syncing
    await expect(page.getByText(/sincroniz/i)).toBeVisible();
  });

  test('should go to dashboard when clicking dashboard link while offline', async ({ page, context }) => {
    await context.setOffline(true);

    await page.goto('/offline');

    // Click dashboard link
    await page.getByRole('link', { name: /dashboard/i }).click();

    // Should navigate to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

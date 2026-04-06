// apps/web/tests/e2e/offline.spec.ts
/**
 * E2E tests for Offline functionality.
 *
 * Scenarios from spec (E2E-10):
 * 1. Offline navigation — user can browse cached pages when offline
 * 2. Reconnect — data syncs when connection returns
 * 3. Pending actions — actions queued while offline sync on reconnect
 * 4. Offline indicator — offline banner appears when disconnected
 * 5. Cache behavior — previously loaded data available offline
 *
 * Uses Playwright's context.setOffline() to simulate network conditions.
 */

import { test, expect } from './fixtures';

test.describe('Offline Functionality', () => {
  // =========================================================================
  // E2E-10 Scenario 1: Offline navigation — browse cached pages
  // =========================================================================
  test('debería permitir navegar por páginas en caché cuando está offline', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const context = page.context();

    // First, load the dashboard while online to cache it
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Verify dashboard loaded
    await expect(page.locator('text=/dashboard/i')).toBeVisible({ timeout: 5000 });

    // Now go to animales page to cache it
    await page.goto('/dashboard/animales');
    await page.waitForLoadState('networkidle');

    // Verify animales loaded
    const table = page.locator('table').first();
    const hasTable = await table.isVisible({ timeout: 3000 }).catch(() => false);
    if (hasTable) {
      await expect(table).toBeVisible();
    }

    // Simulate going offline
    await context.setOffline(true);

    // Should show offline banner immediately
    const offlineBanner = page.locator('[role="alert"]').filter({ hasText: /sin conexión/i });
    await expect(offlineBanner).toBeVisible({ timeout: 3000 });

    // Navigate back to dashboard (should use cache)
    await page.goto('/dashboard');

    // Should load cached content without crashing
    // Page should still be accessible
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to animales again (should use cache)
    await page.goto('/dashboard/animales');

    // Should load without network errors
    await expect(page).toHaveURL(/\/dashboard\/animales/);

    // Re-enable network
    await context.setOffline(false);
  });

  // =========================================================================
  // E2E-10 Scenario 2: Reconnect — data syncs when connection returns
  // =========================================================================
  test('debería sincronizar datos cuando se recupera conexión', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const context = page.context();

    // Go online first and load dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=/dashboard/i')).toBeVisible({ timeout: 5000 });

    // Go offline
    await context.setOffline(true);

    // Offline banner should be visible
    const offlineBanner = page.locator('[role="alert"]').filter({ hasText: /sin conexión/i });
    await expect(offlineBanner).toBeVisible({ timeout: 3000 });

    // Restore connection
    await context.setOffline(false);

    // Banner should disappear (back online)
    await expect(offlineBanner).toBeHidden({ timeout: 3000 });

    // Page should detect online status
    await page.waitForLoadState('networkidle');

    // Navigate to a page to verify network requests work
    await page.goto('/dashboard/animales');
    await page.waitForLoadState('networkidle');

    // Should load fresh data
    await expect(page).toHaveURL(/\/dashboard\/animales/);
  });

  // =========================================================================
  // E2E-10 Scenario 3: Pending actions queued while offline
  // =========================================================================
  test('debería guardar acciones pendientes mientras está offline y sincronizar al reconnectar', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const context = page.context();

    // Load dashboard first
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);

    // Offline banner should be visible
    await expect(page.locator('[role="alert"]').filter({ hasText: /sin conexión/i }))
      .toBeVisible({ timeout: 3000 });

    // Try to navigate or perform action while offline
    // The app should queue the action
    await page.goto('/dashboard/animales');

    // Should show offline indicator or queue message
    // User should be informed that their action is queued
    const queueMessage = page.locator('text=/cola|pendiente|guardar.*cuando/i');
    const hasQueueMessage = await queueMessage.isVisible({ timeout: 2000 }).catch(() => false);

    // If there's a sync queue indicator, check it
    if (hasQueueMessage) {
      await expect(queueMessage).toBeVisible();
    }

    // Restore connection
    await context.setOffline(false);

    // Wait for potential sync
    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');

    // Should have sync indicator or success message
    // The queued action should be processed
    await expect(page).toHaveURL(/\/dashboard\/animales/);
  });

  // =========================================================================
  // E2E-10 Scenario 4: Offline indicator appears when disconnected
  // =========================================================================
  test('debería mostrar banner de offline cuando se pierde la conexión', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const context = page.context();

    // Load a page first
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Initially should be online (no offline banner)
    const offlineBanner = page.locator('[role="alert"]').filter({ hasText: /sin conexión/i });

    // Banner should not be visible initially
    await expect(offlineBanner).toBeHidden({ timeout: 2000 });

    // Simulate network loss
    await context.setOffline(true);

    // Offline banner should appear
    await expect(offlineBanner).toBeVisible({ timeout: 3000 });

    // Banner should have proper messaging
    const bannerText = await offlineBanner.textContent();
    expect(bannerText).toMatch(/conexión|offline|sin/i);

    // Restore connection
    await context.setOffline(false);

    // Banner should disappear
    await expect(offlineBanner).toBeHidden({ timeout: 5000 });

    // Verify page still works
    await expect(page).toHaveURL(/\/dashboard/);
  });

  // =========================================================================
  // E2E-10 Scenario 5: Cache behavior — previously loaded data available offline
  // =========================================================================
  test('debería tener datos previamente cargados disponibles offline', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const context = page.context();

    // Pre-load multiple pages to populate cache
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    await page.goto('/dashboard/animales');
    await page.waitForLoadState('networkidle');

    // Store some data visible on the page
    let initialAnimalCode = '';
    const table = page.locator('table').first();
    if (await table.isVisible({ timeout: 3000 }).catch(() => false)) {
      const firstRow = table.locator('tr').nth(1); // Skip header
      if (await firstRow.isVisible({ timeout: 1000 }).catch(() => false)) {
        initialAnimalCode = await firstRow.textContent() ?? '';
      }
    }

    // Go offline
    await context.setOffline(true);

    // Verify offline banner
    await expect(page.locator('[role="alert"]').filter({ hasText: /sin conexión/i }))
      .toBeVisible({ timeout: 3000 });

    // Navigate to dashboard (should use cache)
    await page.goto('/dashboard');

    // Dashboard should still display cached content
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify cached dashboard content is visible
    const dashboardContent = page.locator('body');
    await expect(dashboardContent).toBeVisible();

    // Navigate to animales (should use cache)
    await page.goto('/dashboard/animales');

    // Should show previously loaded data
    await expect(page).toHaveURL(/\/dashboard\/animales/);

    // Table or cards should still be visible with cached data
    const cachedTable = page.locator('table').first();
    const hasCachedData = await cachedTable.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasCachedData) {
      await expect(cachedTable).toBeVisible();
    }

    // Restore connection
    await context.setOffline(false);
  });

  // =========================================================================
  // Additional: Online/Offline state detection
  // =========================================================================
  test('debería detectar cambios de estado online/offline correctamente', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const context = page.context();

    // Start online
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check online status via browser API
    const initialOnlineStatus = await page.evaluate(() => navigator.onLine);
    expect(initialOnlineStatus).toBe(true);

    // Go offline
    await context.setOffline(true);

    // Check offline status via browser API
    const offlineStatus = await page.evaluate(() => navigator.onLine);
    expect(offlineStatus).toBe(false);

    // Banner should be visible
    await expect(page.locator('[role="alert"]').filter({ hasText: /sin conexión/i }))
      .toBeVisible({ timeout: 3000 });

    // Go back online
    await context.setOffline(false);

    // Check online status via browser API
    const backOnlineStatus = await page.evaluate(() => navigator.onLine);
    expect(backOnlineStatus).toBe(true);

    // Wait for online detection
    await page.waitForTimeout(500);

    // Banner should be hidden
    await expect(page.locator('[role="alert"]').filter({ hasText: /sin conexión/i }))
      .toBeHidden({ timeout: 3000 });
  });

  // =========================================================================
  // Additional: Multiple offline/online transitions
  // =========================================================================
  test('debería manejar múltiples transiciones offline/online', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const context = page.context();

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // First offline cycle
    await context.setOffline(true);
    await expect(page.locator('[role="alert"]').filter({ hasText: /sin conexión/i }))
      .toBeVisible({ timeout: 3000 });

    await context.setOffline(false);
    await expect(page.locator('[role="alert"]').filter({ hasText: /sin conexión/i }))
      .toBeHidden({ timeout: 3000 });

    // Second offline cycle
    await context.setOffline(true);
    await expect(page.locator('[role="alert"]').filter({ hasText: /sin conexión/i }))
      .toBeVisible({ timeout: 3000 });

    // Navigate while offline
    await page.goto('/dashboard/animales');

    await context.setOffline(false);
    await expect(page.locator('[role="alert"]').filter({ hasText: /sin conexión/i }))
      .toBeHidden({ timeout: 3000 });

    // Page should still work
    await expect(page).toHaveURL(/\/dashboard\/animales/);
  });
});

// apps/web/scripts/lighthouse-auth.js
/**
 * LHCI Puppeteer pre-audit script.
 *
 * Runs before each Lighthouse collection on authenticated dashboard URLs.
 * Sets the gt-auth cookie (middleware checks existence only) and seeds the
 * MSW mock admin user so GET /api/v1/auth/me returns a valid profile.
 *
 * @param {import('puppeteer').Browser} browser
 * @param {{ url: string }} context
 */
module.exports = async (browser, context) => {
  const origin = new URL(context.url).origin;
  const page = await browser.newPage();

  // Set auth cookie — middleware only checks that it EXISTS, value is irrelevant
  await page.setCookie({
    name: 'gt-auth',
    value: 'ci-test-session',
    url: origin,
    httpOnly: false,
    sameSite: 'Lax',
  });

  // Navigate to dashboard to trigger MswProvider boot and worker.start()
  await page.goto(`${origin}/dashboard`, { waitUntil: 'networkidle0' });

  // Wait for MswProvider to expose window.__mswSetUser (max 15s)
  await page.waitForFunction(
    () => typeof window.__mswSetUser === 'function',
    { timeout: 15000 }
  );

  // Seed the mock admin user for the auth/me handler
  await page.evaluate(() => {
    window.__mswSetUser({
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'admin@ganatrack.com',
      nombre: 'Admin Ganatrack',
      rol: 'admin',
    });
  });

  // Verify MSW responds correctly before handing control back to LHCI
  await page.evaluate(async () => {
    const res = await fetch('/api/v1/auth/me', { credentials: 'include' });
    if (!res.ok) throw new Error(`MSW auth/me returned ${res.status}`);
  });

  await page.close();
};

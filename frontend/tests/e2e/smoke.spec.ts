import { test, expect } from '@playwright/test';

/**
 * Smoke e2e with API mocked — verifies the SPA boots (vendored React + DS),
 * restores an anonymous session via /auth/me, and can complete a register →
 * capture happy path (httpOnly cookie session; no localStorage token).
 */
test.describe('Trace smoke', () => {
  test.beforeEach(async ({ page }) => {
    let signedIn = false;

    await page.route('**/api/**', async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      const path = url.pathname.replace(/^\/api/, '') || url.pathname;
      const method = req.method();

      if (method === 'POST' && path.endsWith('/auth/register')) {
        signedIn = true;
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          headers: {
            'set-cookie': 'trace_session=e2e-token; Path=/; HttpOnly; SameSite=Strict',
          },
          body: JSON.stringify({
            token: 'e2e-token',
            user: { id: 'u1', email: 'e2e@example.com', createdAt: new Date().toISOString() },
          }),
        });
        return;
      }
      if (method === 'GET' && path.endsWith('/auth/me')) {
        if (!signedIn) {
          await route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({
              error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authentication' },
            }),
          });
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'u1',
            email: 'e2e@example.com',
            createdAt: new Date().toISOString(),
          }),
        });
        return;
      }
      if (method === 'GET' && path.endsWith('/entries/tags')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ tags: [] }),
        });
        return;
      }
      if (method === 'GET' && path.includes('/entries') && !path.includes('/export')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: [], nextCursor: null }),
        });
        return;
      }
      if (method === 'POST' && path.endsWith('/entries')) {
        const body = JSON.parse(req.postData() || '{}');
        const now = new Date().toISOString();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'e1',
            body: body.body,
            occurredAt: now,
            createdAt: now,
            updatedAt: now,
            deleted: false,
            source: 'manual',
          }),
        });
        return;
      }
      if (method === 'POST' && path.endsWith('/auth/logout')) {
        signedIn = false;
        await route.fulfill({ status: 204 });
        return;
      }
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 'NOT_FOUND', message: path } }),
      });
    });
  });

  test('landing → register → capture a moment', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/');

    await page.getByRole('button', { name: 'Start your trace' }).first().click({ timeout: 30_000 });

    await page.getByLabel(/^email$/i).fill('e2e@example.com');
    await page.getByLabel(/^password$/i).fill('correct horse battery');
    await page.getByRole('button', { name: /create account|register|start/i }).click();

    const capture = page.locator('textarea').first();
    await expect(capture).toBeVisible({ timeout: 20_000 });
    await capture.fill('hello from e2e #smoke');
    await capture.press('Enter');

    await expect(page.getByText(/hello from e2e/i).first()).toBeVisible({ timeout: 10_000 });
  });
});

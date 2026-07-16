import { test, expect } from '@playwright/test';

/**
 * Live API smoke — runs when E2E_LIVE=1 against a real backend on :4000
 * (proxied by Vite preview). Validates register → capture against Express.
 */
test.describe('Trace live API smoke', () => {
  test.skip(!process.env.E2E_LIVE, 'Set E2E_LIVE=1 with API on :4000 to run');

  test('health + register + capture', async ({ page, request }) => {
    test.setTimeout(90_000);

    const health = await request.get('http://127.0.0.1:4000/api/health');
    expect(health.ok()).toBeTruthy();

    await page.goto('/');
    await page.getByRole('button', { name: 'Start your trace' }).first().click({ timeout: 30_000 });

    const email = `live-${Date.now()}@example.com`;
    await page.getByLabel(/^email$/i).fill(email);
    await page.getByLabel(/^password$/i).fill('correct horse battery');
    await page.getByRole('button', { name: /create account|register|start/i }).click();

    const capture = page.locator('textarea').first();
    await expect(capture).toBeVisible({ timeout: 20_000 });
    await capture.fill('live e2e moment #live');
    await capture.press('Enter');
    await expect(page.getByText(/live e2e moment/i).first()).toBeVisible({ timeout: 10_000 });
  });
});

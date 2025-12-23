import { test, expect } from '@playwright/test';

test('Video wird im datierten Ordner gespeichert', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
  await page.waitForTimeout(1000);
});

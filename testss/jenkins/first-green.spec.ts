import { test, expect } from '@playwright/test';

test('Erster grüner Test – Pipeline wird bald SUCCESS!', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
});
import { test, expect } from '@playwright/test';

test('SDET+++++ Pipeline – erster grüner Test läuft!', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
});

test('einfache Assertion – immer grün', async () => {
  expect(true).toBe(true);
});

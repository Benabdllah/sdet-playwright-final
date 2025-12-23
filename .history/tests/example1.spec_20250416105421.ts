import { test, expect } from '@playwright/test';

test('Video wird im datierten Ordner gespeichert', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');
  await expect(page).toHaveTitle('Automation Testing Practice');
  await page.waitForTimeout(1000);
});

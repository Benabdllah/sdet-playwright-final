

import { test, expect } from '@playwright/test';


test('locateMultipleElements', async ({ page }) => {
  // 1. Seite laden
await page.goto('https://demoblaze.com/index.html');

// Hard assertions
await expect(page).toHaveTitle('STORE')
await expect(page.locator('.navbar-brand')).toBeVisible()

// Soft assertion
await expect.soft(page).toHaveTitle('STORE') // execution will not stoped in dthe next line
await expect.soft(page.locator('.navbar-brand')).toBeVisible()


});

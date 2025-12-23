

import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test('locateMultipleElements', async ({ page }) => {
  // 1. Seite laden
await page.goto('https://demoblaze.com/index.html');

// Hard assertions
await expect(page).toHaveTitle('STORE')
await expect(page.locator('.navbar-brand')).toBeVisible()

// Soft assertion
await expect.soft(page).toHaveTitle('STORE1') // execution will not stoped
await expect.soft(page.locator('.navbar-brand')).toBeVisible()


});

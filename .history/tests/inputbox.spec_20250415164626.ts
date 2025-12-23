

import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test('locateMultipleElements', async ({ page }) => {
  // 1. Seite laden
await page.goto('https://testautomationpractice.blogspot.com/');

 //Inputbox firstname
 await expect(page.locator('//input[@id="name"])')).toBeVisible


});

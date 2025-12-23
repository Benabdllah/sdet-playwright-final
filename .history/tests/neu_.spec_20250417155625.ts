import { test, expect } from '@playwright/test';

test('Upload File', async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');

  const input = page.locator('Upload Single File');

  // Statt path.join --> einfachen Pfad angeben
  const filePath = 'tests/resources/samplefile.txt'; // relativer Pfad von Projektwurzel

  await input.setInputFiles(filePath);
});

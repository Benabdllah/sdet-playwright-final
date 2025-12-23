import { test, expect } from '@playwright/test';

test('Navigation Test', async ({ page }) => {
    
  await page.goto('https://www.pavanonlinetrainings.com/p/udemy-courses.html');

  // Warte darauf, dass das iFrame geladen ist
  const frameLocator = page.frameLocator('iframe');

  // Suche das Button-Element innerhalb des Frames
  await frameLocator.getByRole('button', { name: 'YouTube' }).click();
});

import { test, expect } from '@playwright/test';

test('Navigation Test', async ({ page }) => {
    
  await page.goto('https://www.pavanonlinetrainings.com/p/udemy-courses.html');

  // Warte darauf, dass das iFrame geladen ist
  const frame = page.frame({ url: /pavanonlinetrainings/ });
  await frame.getByRole('button', { name: 'YouTube' }).click({});
})  

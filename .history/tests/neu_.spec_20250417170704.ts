import { Page, Frame } from '@playwright/test';
import { test, expect } from '@playwright/test';
test('Navigation Test', async ({ page }) => {
    
await page.goto('https://www.pavanonlinetrainings.com/p/udemy-courses.html')

//const frame = page.frame({ name: 'I0_1744899979579' }) || page.frame({ url: new RegExp('I0_1744899979579') });
//   if (!frame) {
//     throw new Error(`❌ Frame mit Name oder URL  nicht gefunden!`);
//   }
  //await frame.getByRole('button', { name: 'YouTube' }).click();

  await page.locator('iframe ng-non-bindable').contentFrame().getByRole('button', { name: 'YouTube' }).first().click();

})

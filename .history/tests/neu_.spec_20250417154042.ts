import { test, expect } from '@playwright/test';

test('Click option', async ({ page }) => {
  // 1. Seite laden
  await page.goto('https://testautomationpractice.blogspot.com/')


  //Inputbox firstname
// await page.locator('#PageList2').getByText("Home").click()

import { Page } from '@playwright/test';

export async function uploadFile(page: Page, selector: string, filePath: string) {
  const input = page.getByLabel(selector);
  await input.setInputFiles(path.join(__dirname,filePath);
}

})

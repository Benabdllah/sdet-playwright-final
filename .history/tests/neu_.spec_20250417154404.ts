import { test, expect } from '@playwright/test';

test('Click option', async ({ page }) => {
  // 1. Seite laden
  await page.goto('https://testautomationpractice.blogspot.com/')


  //Inputbox firstname
// await page.locator('#PageList2').getByText("Home").click()

  const input = page.getByLabel(Upload Single File);
  await input.setInputFiles(path.join(__dirname,filePath);


})

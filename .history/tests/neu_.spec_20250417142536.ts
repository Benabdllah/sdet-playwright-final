import { test, expect } from '@playwright/test';

test('Clic', async ({ page }) => {
  // 1. Seite laden
  await page.goto('https://testautomationpractice.blogspot.com/')


  //Inputbox firstname
// await page.locator('#PageList2').getByText("Home").click()

await page.getByText("Home").click()
})

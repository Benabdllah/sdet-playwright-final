import { test, expect } from '@playwright/test';

test('handel radioButtons', async ({ page }) => {
  // 1. Seite laden
  await page.goto('https://testautomationpractice.blogspot.com/')

    await page.locator("(//input[@id='male'])[1]").check()
  //Inputbox firstname
  await expect(page.locator("(//input[@id='male'])[1]")).toBeVisible()
  await expect(page.locator("(//input[@id='male'])[1]")).toBeChecked()
  expect(await page.locator("(//input[@id='male'])[1]").isChecked()).toBeTruthy()
  expect(await page.locator("(//input[@id='male'])[2]").isChecked()).toBeFalsy()

  
await page.waitFor

});

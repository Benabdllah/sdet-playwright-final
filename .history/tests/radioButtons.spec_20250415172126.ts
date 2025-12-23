import { test, expect } from '@playwright/test';

test('handel radioButtons', async ({ page }) => {
  // 1. Seite laden
  await page.goto('https://testautomationpractice.blogspot.com/')


  //Inputbox firstname
  await expect(page.locator("(//input[@id='male'])[1]")).toBeVisible()
  await expect(page.locator("(//input[@id='male'])[1]")).toBeEmpty()
  await expect(page.locator("(//input[@id='male'])[1]")).toBeEditable()
  await expect(page.locator("(//input[@id='male'])[1]")).toBeEnabled()

  await page.locator("(//input[@id='male'])[1]").ch


});

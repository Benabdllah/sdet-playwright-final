import { test, expect } from '@playwright/test';

test('handel inputbox', async ({ page }) => {
  // 1. Seite laden
  await page.goto('https://testautomationpractice.blogspot.com/')


  //Single checkboxe
  await expect(page.locator("(//input[@id='monday'])[1]")).toBeVisible()
  await expect(page.locator("//input[@id='name']")).toBeEmpty()
  await expect(page.locator("//input[@id='name']")).toBeEditable()
  await expect(page.locator("//input[@id='name']")).toBeEnabled()

  await page.locator("//input[@id='name']").fill('John')


});

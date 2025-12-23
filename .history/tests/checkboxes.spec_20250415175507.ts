import { test, expect } from '@playwright/test';

test('handel inputbox', async ({ page }) => {
  // 1. Seite laden
  await page.goto('https://testautomationpractice.blogspot.com/')


  //Single checkboxe
  await expect(page.locator("(//input[@id='monday'])[1]").check()


  await expect(page.locator("(//input[@id='monday'])[1]")).toBeChecked()
  expect(await page.locator("(//input[@id='monday'])[1]").isChecked()).toBeTruthy()
  expect(await page.locator("(//input[@id='female'])[1]").isChecked()).toBeFalsy()


})

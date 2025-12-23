import { test, expect } from '@playwright/test';

test('handel inputbox', async ({ page }) => {
  // 1. Seite laden
  await page.goto('https://testautomationpractice.blogspot.com/')
  console.log

  //Inputbox firstname
  await expect(page.locator("//input[@id='name'])")).toBeVisible()
  await expect(page.locator('//input[@id="name"])')).toBeEmpty()
  await expect(page.locator('//input[@id="name"])')).toBeEditable()
  await expect(page.locator('//input[@id="name"])')).toBeEnabled()

  await page.locator('//input[@id="name"]').fill('John')


});

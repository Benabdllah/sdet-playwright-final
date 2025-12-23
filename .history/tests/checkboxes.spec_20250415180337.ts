import { test, expect } from '@playwright/test';

test('handel inputbox', async ({ page }) => {
  // 1. Seite laden
  await page.goto('https://testautomationpractice.blogspot.com/')


  //Single checkboxe
  await page.locator("(//input[@id='monday'])[1]").check()

  await expect(page.locator("(//input[@id='monday'])[1]")).toBeChecked()
  expect(await page.locator("(//input[@id='monday'])[1]").isChecked()).toBeTruthy()
  expect(await page.locator("(//input[@id='sunday'])[1]").isChecked()).toBeFalsy()

  //multiple checknoxes
 const checkboxlocators=["(//input[@id='monday'])[1]","(//input[@id='sunday'])[1]","(//input[@id='saturday'])[1]"]

 for (const locator of checkboxlocators)
{   if (await page.locator(locator).isChecked())
    await page.locator(locator).check()
 }



})

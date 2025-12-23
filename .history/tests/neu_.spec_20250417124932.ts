import { test, expect } from '@playwright/test';

test('handel inputbox', async ({ page }) => {
  // 1. Seite laden
  await page.goto('https://testautomationpractice.blogspot.com/')


  //Inputbox firstname
 await page.getByText('(//a[normalize-space()='Home'])[1]").click()


})

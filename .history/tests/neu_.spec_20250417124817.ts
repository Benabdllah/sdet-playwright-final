import { test, expect } from '@playwright/test';

test('handel inputbox', async ({ page }) => {
  // 1. Seite laden
  await page.goto('https://testautomationpractice.blogspot.com/')


  //Inputbox firstname
 await page.getByText('div[class="tabs-outer"] li:nth-child(1) a:nth-child(1)').click()


})

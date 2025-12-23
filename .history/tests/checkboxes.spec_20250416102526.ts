import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('handel inputbox', async ({page }) => {
  const context = await browser.newContext({
    recordVideo: { dir: 'test-results/videos' }
  });
  const page = await context.newPage();
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
    {await page.locator(locator).uncheck()}
 }

 const video = page.video();
 await context.close();

 if (video) {
   const now = new Date();
   const timestamp = now.toISOString().replace(/[:.]/g, '-'); // z. B. 2024-04-14T20-45-12-345Z
   const filename = `testvideo-${timestamp}.webm`;
   const savePath = path.resolve('playwright-report/videos', filename);

   fs.mkdirSync(path.dirname(savePath), { recursive: true });
   await video.saveAs(savePath);

   console.log('🎬 Video gespeichert unter:', savePath);
 }


})

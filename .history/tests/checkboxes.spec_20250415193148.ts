import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('handel inputbox', async ({ browser,page }) => {
    
  
  // 1. Seite laden
  await page.goto('https://testautomationpractice.blogspot.com/')

  await page.waitForTimeout(3000)
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
 await page.waitForTimeout(1000);
const video = page.video(); // Merken vor Schließen!
//await context.close(); // 🔴 Wichtig: Erst jetzt ist das Video vollständig!
const videoPath = await page.video()?.path();

if (video) {
    const saveTo = path.resolve('playwright-report/videos', `${Date.now()}.webm`);
    fs.mkdirSync(path.dirname(saveTo), { recursive: true });
    await video.saveAs(saveTo); // ✅ Hier: Sicheres Speichern
    console.log('🎬 Video gespeichert unter:', saveTo);
  }
})

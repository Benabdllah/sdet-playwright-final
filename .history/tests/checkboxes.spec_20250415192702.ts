import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('handel inputbox', async ({ browser }) => {
    
  const page = await context.newPage();
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
 
const video = page.video(); // Merken vor Schließen!
await context.close(); // 🔴 Wichtig: Erst jetzt ist das Video vollständig!
const videoPath = await page.video()?.path();

if (videoPath) {
  const targetPath = path.resolve('playwright-report/videos', path.basename(videoPath));
  fs.mkdirSync(path.dirname(targetPath), { recursive: true }); // Verzeichnis erstellen, falls nötig
  fs.renameSync(videoPath, targetPath);
  console.log('🎬 Video verschoben nach:', targetPath);
}
})

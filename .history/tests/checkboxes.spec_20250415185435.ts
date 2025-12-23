import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

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
    
    {await page.locator(locator).uncheck()}
 }
 
 
 const video = await page.video();
  const pathToVideo = await video?.path();

  if (pathToVideo) {
    const target = path.join('videos', `${browserName}-${Date.now()}.webm`);
    fs.copyFileSync(pathToVideo, target);
    console.log('🎥 Video kopiert nach:', target)
    
})

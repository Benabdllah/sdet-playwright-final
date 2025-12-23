import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('handel inputbox', async ({browser }) => {
  const context = await browser.newContext({
    recordVideo: { dir: 'test-results/videos' }
  });
  const page = await context.newPage();
  // 1. Seite laden
  await page.goto('https://testautomationpractice.blogspot.com/')

 // Multiple way to select option from dropdown
 await page.locator("#country").selectOption({label:'India'}) //label/visible
 await page.locator("#country").selectOption('India') //visible text
 await page.locator("#country").selectOption({value:'uk'}) //value
 await page.locator("#country").selectOption({index:1}) //by using index
 await page.selectOption('#country','India') //by text

 //Assertion
 //1) check number of options in dropdaown -Approach1
 const page.$$('#country option').

})

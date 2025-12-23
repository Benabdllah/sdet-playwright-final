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
 //3) check number of options in dropdaown -Approach1
 const options=await page.$$('#country option')
 console.log("Number of option:", (options).length)

 //4) check presence of value in the dropdown -Approach2
  const content= await page.locator('#country').textContent()
  expect(content.includes('India')).toBeTruthy()

  //5) check presence of value in the dropown -Approach3



})

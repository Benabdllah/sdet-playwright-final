import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { selectDropdownOption } from '../utils/dropdown-utils';
import { takescreen } from '../utils/screenshot-util';

test('Bootstrap dropdown', async ({page}) => {
 
 // 1. Seite laden
  await page.goto('https://www.jquery-az.com/boots/demo.php?ex=63.0_2')
  const selectOption= await page.locator('.multiselect-selected-text')
  await selectOption.click({force:true}) //click on dropdown
 
  //1
  const options= page.locator('ul>li label input')
  await expect(options).toHaveCount(11)

  //await page.waitForTimeout(5000)

  //2
  const options2= await page.$$('ul>li label input')
  expect(options2.length).toBe(11)

  //3
  const options3=await page.$$('ul>li label')

  for (let option of options3){
    const value= await option?.textContent()//getAttribute('value')
    console.log('value is ',value)
    if (value.includes('Angular') || value.includes('Java')){
        const input = await option.$('input'); // ⬅️ Selektiere das <input> im Label
        page.waitForSelector
        await input?.click({ force: true });
        
    }
 
  }
  takescreen(page,'')
  await page.waitForTimeout(5000)
})
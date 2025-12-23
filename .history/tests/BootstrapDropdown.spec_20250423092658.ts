import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('handel dropDowns', async ({page}) => {
 
 // 1. Seite laden
  await page.goto('https://www.jquery-az.com/onlinedemo.php')
  await page.locator('.multiselect').click() //click on dropdown

  //1
  const options= await page.locator('ul>li label input')
  await expect(options).toHaveCount(11)

  await p

})
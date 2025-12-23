import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('Bootstrap dropdown', async ({page}) => {
 
 // 1. Seite laden
  await page.goto('https://www.jquery-az.com/boots/demo.php?ex=63.0_2')
  await page.locator('.multiselect').click() //click on dropdown

  //1
  const options= page.locator('ul>li label input')
  await expect(options).toHaveCount(11)

  await page.waitForTimeout(5000)

  //2
  const options2= page.4('ul>li label input')
  await expect(options2.length).toBe(11)

})
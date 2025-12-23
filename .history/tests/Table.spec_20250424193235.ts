import { test, expect } from '@playwright/test';
import { handleAlert } from '../utils/alert-utils';
import { takescreen } from '../utils/screenshot-util';

test('Alert with Ok', async ({page }) => {
 
await page.goto('https://testautomationpractice.blogspot.com/')

const table= await page.locator('productTable')

//total number of rows & columns
const columns= await table.locator('thead tr th')
console.log('Number of ')



})

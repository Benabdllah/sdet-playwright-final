import { test, expect } from '@playwright/test';
import { handleAlert } from '../utils/alert-utils';
import { takescreen } from '../utils/screenshot-util';

test('handling table', async ({page }) => {
 
await page.goto('https://testautomationpractice.blogspot.com/')

const table= await page.locator('productTable')

//total number of rows & columns
const columns= await table.locator('table thead tr th')
console.log('Number of columns:', await columns.count())

const rows= await table.locator('tbody tr')
console.log('Number of rows:', await rows.count())
expect(await columns.count()).toBe(4)
expect(await rows.count()).toBe(5)



})

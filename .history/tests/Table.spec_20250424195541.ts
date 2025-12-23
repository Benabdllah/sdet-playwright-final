import { test, expect } from '@playwright/test';
import { handleAlert } from '../utils/alert-utils';
import { takescreen } from '../utils/screenshot-util';

test('handling table', async ({page }) => {
 
await page.goto('https://testautomationpractice.blogspot.com/')

const table= await page.locator('productTable')

//total number of rows & columns
const columns= await table.locator('div[id="HTML8"] thead tr th')
console.log('Number of columns:', await columns.count())

const rows= await table.locator('body > div:nth-child(4) > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div:nth-child(3) > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(4) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(5) > div:nth-child(2) > div:nth-child(2) > table:nth-child(1) > tbody:nth-child(2) > tr')
console.log('Number of rows:', await rows.count())
expect(await columns.count()).toBe(4)
expect(await rows.count()).toBe(5)

page.waitForTimeout(5000)

})

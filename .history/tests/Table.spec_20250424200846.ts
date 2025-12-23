import { test, expect } from '@playwright/test';
import { handleAlert } from '../utils/alert-utils';
import { takescreen } from '../utils/screenshot-util';

test('handling table', async ({page }) => {
 
await page.goto('https://testautomationpractice.blogspot.com/')
handleAlert(page,'accept'cookie-choices-inner')
const table= await page.locator('productTable')

//1 total number of rows & columns
const columns= await table.locator('div[id="HTML8"] thead tr th')
console.log('Number of columns:', await columns.count())

const rows= await table.locator('div[id="HTML8"] tbody tr')
console.log('Number of rows:', await rows.count())
expect(await columns.count()).toBe(4)
expect(await rows.count()).toBe(5)


// 2) select check box for product 4

const machdRow= rows.filter({ has: page.locator('td'),hasText:'Product4'})
await machdRow.locator('input').check()
page.waitForTimeout(5000)

})

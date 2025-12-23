import { test, expect } from '@playwright/test';
import { handleAlert } from '../utils/alert-utils';
import { takescreen } from '../utils/screenshot-util';
import { getRowCount } from '../utils/Table-utils';

test('handling table', async ({page }) => {
 
await page.goto('https://testautomationpractice.blogspot.com/')
handleAlert(page,'accept','cookie-choices-inner')
const table= await page.locator('#productTable')

//1 total number of rows & columns
const columns= await table.locator('thead tr th')
console.log('Number of columns:', await columns.count())

const rows= await table.locator('tbody tr')
console.log('Number of rows:', await rows.count())
expect(await columns.count()).toBe(4)
expect(await rows.count()).toBe(5)

const fctrows= await getRowCount(table)
console.log('Number of fctrows:', fctrows)
getColumnCount const fctrows= await getRowCount(table)
console.log('Number of fctColumn:', fctrows)

// 2) select check box for product 4

const machdRow= rows.filter({ has: page.locator('td'),hasText:'Smartphone'})
await machdRow.locator('input').check()
await page.waitForTimeout(5000)

})

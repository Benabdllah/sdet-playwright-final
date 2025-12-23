import { test, expect } from '@playwright/test';
import { handleAlert } from '../utils/alert-utils';
import { takescreen } from '../utils/screenshot-util';
import { getRowCount,getColumnCount,getRowByCellText,checkCheckboxInRow } from '../utils/Table-utils';

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
const fctColumn= await getColumnCount(table)
console.log('Number of fctColumn:', fctColumn)
//getRowByCellText
const row=await getRowByCellText(table,'Laptop')
//checkCheckboxInRow
await checkCheckboxInRow(row)
await takescreen(page, 'laptop')
// 2) select check box for product 4

const machdRow= rows.filter({ has: page.locator('td'),hasText:'Smartphone'})
await machdRow.locator('input').check()
await takescreen(page, 'Smartphone')
await page.waitForTimeout(5000)

//3) select multiple products by re-usable function

async function  selectProduct(page,rows,name) {
    const machedRow=row.filter({has: page.locator('td'),hasText:name})
    await machdRow.locator('input').check()
    
}

})

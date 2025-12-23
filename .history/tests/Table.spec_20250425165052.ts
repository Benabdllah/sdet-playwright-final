import { test, expect } from '@playwright/test';
import { handleAlert } from '../utils/alert-utils';
import { takescreen } from '../utils/screenshot-util';
import { getRowCount,getColumnCount,getRowByCellText,checkCheckboxInRow,uncheckCheckboxInRow,getCellText } from '../utils/Table-utils';
import { compareTableWithCSV } from '../utils/table-csv-comparator';
import { ro } from '@faker-js/faker/.';

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
// Function getRowByCellText
const row=await getRowByCellText(table,'Laptop')
// Function checkCheckboxInRow
await checkCheckboxInRow(row)

// 2) select check box for product 4

const machdRow= rows.filter({ has: page.locator('td'),hasText:'Smartphone'})
await machdRow.locator('input').check()




//3) select multiple products by re-usable function
await selectProduct(rows,page,'Laptop')
//await takescreen(page, 'diselct')
async function  selectProduct(rows,page,name:string) {
    const machedRow=rows.filter({has: page.locator('td'),hasText:name})
    await machedRow.locator('input').uncheck()
}

//4 print all product details using loop
for (let i=0; await rows.count();i++)
{
   const row= rows.nth(i)
   const tds=row.locator('td') 
    
        for (let j=0; await tds.count(),j++)
    

}

await page.waitForTimeout(2000)
})
test('Tabellenfunktionen erweitert testen', async ({ page }) => {
    await page.goto('https://testautomationpractice.blogspot.com/');
    const table = page.locator('#productTable');
  
    const product4Row = getRowByCellText(table, 'Smartwatch');
  
    // Checkbox aktivieren
    await checkCheckboxInRow(product4Row);
    await expect(product4Row.locator('input[type="checkbox"]')).toBeChecked();
  
    // Checkbox deaktivieren
    await uncheckCheckboxInRow(product4Row);
    await expect(product4Row.locator('input[type="checkbox"]')).not.toBeChecked();
  
    // Text aus zweiter Spalte lesen
    const value = await getCellText(product4Row, 2);
    console.log('Spalte 2 Wert:', value);
  
    // Optional: Button in letzter Spalte klicken (wenn vorhanden)
    // await clickButtonInRow(product4Row, 'button');
  });
  test('Tabelleninhalt mit CSV vergleichen', async ({ page }) => {
    await page.goto('https://testautomationpractice.blogspot.com/');
    const table = page.locator('#productTable');
  
    await compareTableWithCSV(table, 'test-data/products.csv');
  });
  
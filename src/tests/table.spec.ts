import { Page,test, expect } from '@playwright/test';
import { getRowCount,getColumnCount,getRowByCellText,checkCheckboxInRow,uncheckCheckboxInRow,getCellText } from '../../utils/Table-utils';
import { compareTableWithCSV, vergleichTabelleMitCSV } from '../../utils/table-csv-comparator';
import { selectProduct } from '../../utils/checkbox-utils';
import { ro } from '@faker-js/faker/.';

test('handling table', async ({page}) => {
 
await page.goto('https://testautomationpractice.blogspot.com/')
//handleAlert(page,'accept','cookie-choices-inner')

const table = page.locator('#productTable')

// 1️⃣ Alle Spalten finden
const columns = table.locator('thead tr th') //tabel head tr th
const spalte= page.locator('#productTable').locator('thead tr th') //shadow dom tabelle
// 2️⃣ Anzahl abwarten und speichern
const columnCount = await columns.count()

// 3️⃣ Loggen und prüfen
console.log('Number of columns:', columnCount)
expect(columnCount).toBe(4)


//oder 
//const fctColumn= await getColumnCount(table)
//console.log('Number of fctColumn:', fctColumn)

//2 total number of rows 
const rows= await table.locator('tbody tr')
//console.log('Number of rows:', await rows.count())

//expect(await rows.count()).toBe(5)

//oder
//const fctrows= await getRowCount(table)
//console.log('Number of fctrows:', fctrows)

// Function getRowByCellText
const row= getRowByCellText(table,'Laptop')

// Function checkCheckboxInRow
await checkCheckboxInRow(row)

// 2) select check box for product 4

const matchedRow= rows.filter({ has: page.locator('td'),hasText:'Smartphone'})
await matchedRow.locator('input').check()


// //3) select multiple products by re-usable function
await selectProduct(rows,'Laptops', 'uncheck')

await selectProductVer2(rows, 'laptop')
async function  selectProductVer2(rows:any,name:string) {
    const matcheddRow=rows.filter({has: page.locator('td'),hasText:name})
    await matcheddRow.locator('input').uncheck()
}




//4 print all product details using loop
for (let i=0; i<await rows.count();i++)
{
   const row=rows.nth(i) // einzelne row indizieren
   const inhalt=row.locator('td') 
    
        for (let j=0; j<await inhalt.count()-1;j++)// -1 -> wir brauchen die letzte Spalte nicht
        {
            console.log(await inhalt.nth(j).textContent())
        }
}

//5
// read data from all the Pages in the table

const pages=page.locator('.pagination li a')
console.log('Number of pages in the table: ', await pages.count())

for (let p=0; p< await pages.count();p++)
{
    if (p>0)
    {
        await pages.nth(p).click()
    }
    for (let i=0; i<await rows.count();i++)
        {
           const row=rows.nth(i)
           
           const tds=row.locator('td') 

                for (let j=0; j<await tds.count()-1;j++)// -1 -> wir brauchen die letzte Spalte nicht
                {
                    console.log(await tds.nth(j).textContent())
                }
        }
    
}

//await page.waitForTimeout(2000)
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
    await vergleichTabelleMitCSV(table, 'test-data/products.csv');
  });
  
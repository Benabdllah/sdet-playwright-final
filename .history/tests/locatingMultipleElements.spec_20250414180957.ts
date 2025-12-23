

import { test, expect } from '@playwright/test';

test('locateMultipleElements', async ({ page }) => {
  // 1. Seite laden
  await page.goto('https://demoblaze.com/index.html');
  /*const links = await page.$$('a')

for(const link of links)
{
        const linktext= await link.textContent()	
        console.log(linktext);
}*/


  // 2. Warten, bis die Produkte sichtbar sind
  await page.waitForSelector('#tbodyid h4 a'); // ✅ korrekt warten auf Produkte

  // 3. Alle Produkt-Links (Namen) sammeln – CSS statt XPath verwenden
  const products = await page.$$('#tbodyid h4 a'); // ✅ CSS-Selektor verwenden

  // 4. Produktnamen auslesen und ausgeben
  for (const product of products) {
    const prodname = await product.textContent();
    console.log('Der Produkt heißt: ' + prodname?.trimRight());
  }
});


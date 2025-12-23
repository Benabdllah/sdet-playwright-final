

import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test('locateMultipleElements', async ({ page }) => {
  // 1. Seite laden
await page.goto('https://demoblaze.com/index.html');


const links = await page.$$('a')
const linkList:string[]=[]
for(const link of links)
{
        const linktext= await link.textContent()
        if(linktext)
        {
            linkList.push(linktext)
            console.log ('gefunden: '+ linkList)
        }
}
fs.writeFileSync('linktext.txt',linkList.join)        



  // 2. Warten, bis die Produkte sichtbar sind
  await page.waitForSelector('#tbodyid h4 a'); // ✅ korrekt warten auf Produkte

  // 3. Alle Produkt-Links (Namen) sammeln – CSS statt XPath verwenden
  const products = await page.$$('#tbodyid h4 a'); // ✅ CSS-Selektor verwenden

  // 4. Produktnamen auslesen und ausgeben
  for (const product of products) {
    const prodname = await product.textContent();
    console.log('Der Produkt heißt: ' + prodname?.trim());
  }
});


test('Speichere Produktnamen in Datei', async ({ page }) => {
  await page.goto('https://demoblaze.com/index.html');
  await page.waitForSelector('#tbodyid h4 a');

  const products = await page.$$('#tbodyid h4 a');
  const produktListe: string[] = [];

  for (const product of products) {
    const name = (await product.textContent())?.trim();
    if (name) {
      produktListe.push(name);
      console.log('Gefunden:', name);
    }
  }

  // Schreibe in Datei
  //fs.writeFileSync('produkte.txt', produktListe.join('\n'), 'utf-8');
  fs.appendFileSync('produkte.txt', produktListe.join('\n'), 'utf-8');
  console.log('Produktnamen wurden in "produkte.txt" gespeichert.');
});

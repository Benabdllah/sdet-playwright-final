

import { el } from '@faker-js/faker/.';
import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test('locateMultipleElements', async ({ page }) => {
  // 1. Seite laden
await page.goto('https://demoblaze.com/index.html');


const links = await page.$$('a') // jami3 les links 10 
const linkList:string[] = []
for(const link of links)
{
        const linktext= await link.textContent()
        if(linktext)
        {
            linkList.push(linktext)
            console.log ('gefunden: '+ linktext)
        }
}
const benlin=await Promise.all(links.map(el => el.textContent()))

console.log('Alle Ben Links:', benlin.join(', ')?.trim());// trim entfernt unnötige Leerzeichen
console.log('Alle Ben2 Links:', benlin.map(t => t?.trim()));
benlin.forEach((Text, index) => {
    console.log(`${index+1}. ${Text?.trim()}`); 
  }) 
fs.writeFileSync('produkte.txt',linkList.join('\n'),'utf-8')        



  // 2. Warten, bis die Produkte sichtbar sind
await page.waitForSelector('#tbodyid h4 a'); // ✅ korrekt warten auf Produkte

  // 3. Alle Produkt-Links (Namen) sammeln – CSS statt XPath verwenden
  const products = await page.$$('#tbodyid h4 a'); // ✅ CSS-Selektor verwenden 2produkten

  // 4. Produktnamen auslesen und ausgeben
  for (const product of products) {
    const produktname :string= (await product.textContent())?.trim();
    console.log('Der Produkt heißt: ' + produktname)
}
})
;


test('Speichere Produktnamen in Datei', async ({ page }) => {
  await page.goto('https://demoblaze.com/index.html');
  await page.waitForSelector('#tbodyid h4 a');

  const products = await page.$$('#tbodyid h4 a');
  const produktListe: string[] = [];

  for (const product of products) {
    const name = (await product.textContent())?.trim(); //trim entfernt Leerzeichen
    if (name) {
      produktListe.push(name);
      console.log('Gefunden:', name);
    }
  }

  // Schreibe in Datei
  fs.writeFileSync('produkte.txt', produktListe.join('\n'), 'utf-8');
  //fs.appendFileSync('produkte.txt', produktListe.join('\n'), 'utf-8');
  console.log('Produktnamen wurden in "produkte.txt" gespeichert.');
});


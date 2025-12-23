import { Locator, expect } from '@playwright/test';
import { readCSV,readCSVRobust } from './csv-utils';

/**
 * Vergleicht eine HTML-Tabelle mit Werten aus einer CSV-Datei
 */
export async function compareTableWithCSV(table: Locator, csvPath: string) {
  //const csvData = readCSV(csvPath);
  const csvData = readCSVRobust(csvPath);

  const rows = table.locator('tbody tr');

  for (let i = 0; i < csvData.length; i++) {
    const row = rows.nth(i);
    const cells = row.locator('td');

    for (let j = 0; j < csvData[i].length; j++) {
      const actual = await cells.nth(j).innerText();
      const expected = csvData[i][j];

      expect(actual.trim()).toBe(expected);
    }
  }

  console.log('✅ Tabelcontent stimmt mit CSV überein');

}
export async function vergleichTabelleMitCSV(tabelle:Locator,csvPfad:string) {
 
  const csvDaten = readCSV(csvPfad);
  const zeilen = tabelle.locator('tbody tr');

  for (let i = 0; i < csvDaten.length; i++) {
    const zeile = zeilen.nth(i);
    const zellen = zeile.locator('td');

    for (let j = 0; j < csvDaten[i].length; j++) {
      const aktuell = await zellen.nth(j).innerText();
      const erwartet = csvDaten[i][j];
      expect(aktuell.trim()).toBe(erwartet);
    }

}
  console.log('✅ Tabelleninhalt stimmt mit CSV überein');  
}
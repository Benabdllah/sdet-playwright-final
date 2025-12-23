import { Locator, expect } from '@playwright/test';
import { readCSV } from './csv-utils';

/**
 * Vergleicht eine HTML-Tabelle mit Werten aus einer CSV-Datei
 */
export async function compareTableWithCSV(table: Locator, csvPath: string) {
  const csvData = readCSV(csvPath);
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

  console.log('✅ Tabelleninhalt stimmt mit CSV überein');
}

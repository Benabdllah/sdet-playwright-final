import { Locator } from '@playwright/test';

/**
 * Gibt die Anzahl der Zeilen einer HTML-Tabelle zurück.
 */
export async function getRowCount(table: Locator): Promise<number> {
  return await table.locator('tbody tr').count();
}

/**
 * Gibt die Anzahl der Spalten in der ersten Zeile (Header oder Body) zurück.
 */
export async function getColumnCount(table: Locator): Promise<number> {
  return await table.locator('thead tr th').count();
}

/**
 * Wählt eine Zeile basierend auf dem Zelleninhalt aus.
 */
export function getRowByCellText(table: Locator, text: string): Locator {
  return table.locator('tbody tr').filter({ hasText: text });
}

/**
 * Checkt ein Kontrollkästchen innerhalb einer bestimmten Zeile.
 */
export async function checkCheckboxInRow(row: Locator): Promise<void> {
  await row.locator('input[type="checkbox"]').check({ force: true });
}

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { takescreen } from '../utils/alert-utils';
import { selectDropdownOption } from '../utils/dropdown-utils';

test('Bootstrap Dropdown Auswahl', async ({ page }) => {
  // 1. Seite laden
  await page.goto('https://www.jquery-az.com/boots/demo.php?ex=63.0_2');

  // 2. Dropdown öffnen
  const selectOption = page.locator('.multiselect-selected-text');
  await selectOption.click({ force: true });

  // 3. Alle Checkbox-Inputs finden
 const options = page.locator('ul> li>label input');
  await expect(options).toHaveCount(11);

  // 4. Alle Labels finden (nicht nur Inputs!)
  const optionLabels = await page.$$('ul > li label');

  for (const label of optionLabels) {
    const text = (await label.textContent()); // Trim, um unnötige Leerzeichen zu entfernen
    console.log('Gefundener Wert:', text);

    if (text && (text.includes('Angular') || text.includes('Java'))) {
      const input = await label.$('input'); // Hol dir das zugehörige <input>-Feld
      await input?.click({ force: true });
      console.log(`✔️ Ausgewählt: ${text}`);
    }
  }

  // Optional: kleine Pause zum Debuggen
   await page.waitForTimeout(5000);
});

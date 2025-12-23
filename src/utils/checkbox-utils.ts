// 📁 utils/checkbox-utils.ts
import { FrameLocator, Locator, Page } from '@playwright/test';

/**
 * Versucht eine Checkbox per `check()` anzuklicken, oder weicht auf `click()` aus, wenn kein echter <input type="checkbox"> vorliegt.
 * @param context Page oder Frame – wo gesucht wird
 * @param selector CSS- oder XPath-Selektor der Checkbox
 */
export async function checkOrClickCheckbox(
  context: Page | FrameLocator | Locator,
  selector: string
) {
  const element = context.locator(selector);

  try {
    // Prüfen, ob Element ein <input type="checkbox"> ist
    const tagNames = (await element.evaluate(b => b.tagName.toLowerCase()));
    const typeAttr = await element.getAttribute('type');

    if (tagNames === 'input' && typeAttr === 'checkbox') {
      console.log('✅ Element ist ein echtes <input type="checkbox"> → check()');
      await element.check();
    } else {
      console.log('ℹ️ Kein echtes Checkbox-Input – verwende click()');
      await element.click();
    }
  } catch (error) {
    console.error(`❌ Fehler beim Anklicken der Checkbox "${selector}":`, error);
  }
}

// check checkbox in table row

export async function selectProduct(
  rows: Locator,
  name: string,
  action: 'check' | 'uncheck' = 'uncheck'
) {
  const matchedRow = rows.filter({ hasText: name });

  // Prüfen, ob überhaupt ein Treffer existiert
  const count = await matchedRow.count();
  if (count === 0) {
    console.warn(`❗ Kein Produkt mit Namen "${name}" gefunden.`);
    return;
  }

  const checkbox = matchedRow.locator('input[type="checkbox"]');
  if (action === 'check') {
    await checkbox.check();
  } else {
    await checkbox.uncheck();
  }

  console.log(`✅ Produkt "${name}" wurde ${action === 'check' ? 'ausgewählt' : 'abgewählt'}.`);
}


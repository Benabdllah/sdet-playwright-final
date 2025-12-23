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
    const tagName = await element.evaluate(el => el.tagName.toLowerCase());
    const typeAttr = await element.getAttribute('type');

    if (tagName === 'input' && typeAttr === 'checkbox') {
      console.log('✅ Element ist ein echtes <input type="checkbox"> → check()');
      await element.check({ force: true });
    } else {
      console.log('ℹ️ Kein echtes Checkbox-Input – verwende click()');
      await element.click({ force: true });
    }
  } catch (error) {
    console.error(`❌ Fehler beim Anklicken der Checkbox "${selector}":`, error);
  }
}

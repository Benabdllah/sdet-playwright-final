import { Page, expect } from '@playwright/test';

export async function selectDropdownOption(page: Page, selector: string, targetText: string) {
  let optionFound = false;
  const options = await page.$$(selector + ' option');
  for (const option of options) {
    const text = await option.textContent();
    if (text?.trim() === targetText) {
      optionFound = true;
      console.log(targetText, 'ist gefunden')
      break;
    }
  }
  expect(optionFound, `❌ Option "${targetText}" wurde im Dropdown "${selector}" gefunden!`).toBeTruthy();
  await page.selectOption(selector, { label: targetText });
}

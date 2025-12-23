import { Frame, expect } from '@playwright/test';

/**
 * Sicheres Klicken auf ein Element innerhalb eines Frames.
 * Wartet, bis das Element sichtbar und anklickbar ist.
 * 
 * @param frame - Playwright Frame Objekt
 * @param locator - Locator-String oder Rollenbeschreibung
 */
export async function safeClick(frame: Frame, locator: string) {
  const element = frame.locator(locator);
  await expect(element).toBeVisible({ timeout: 5000 });
  await element.click();
}

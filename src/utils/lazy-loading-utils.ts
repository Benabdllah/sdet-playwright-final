import { Page } from '@playwright/test';

export async function waitForLazyElement(page: Page, selector: string, timeout = 10000) {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout });
}

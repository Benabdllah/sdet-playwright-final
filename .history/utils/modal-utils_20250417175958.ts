import { Page } from '@playwright/test';

export async function closeModalIfVisible(page: Page, selector: string) {
  const modal = page.locator(selector);
  if (await modal.isVisible()) {
    await modal.locator('button:has-text("Close")').click();
  }
}

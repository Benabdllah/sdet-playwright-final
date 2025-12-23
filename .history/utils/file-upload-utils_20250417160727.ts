import { Page } from '@playwright/test';

export async function uploadFile(page: Page, selector: string, filePath: string) {
  const input = page.getb(selector);
  await input.setInputFiles(filePath);
}

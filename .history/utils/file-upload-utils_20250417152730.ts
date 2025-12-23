import { Page } from '@playwright/test';

export async function uploadFile(page: Page, selector: string, filePath: string) {
  const input = page.ge(selector);
  await input.setInputFiles(filePath);
}

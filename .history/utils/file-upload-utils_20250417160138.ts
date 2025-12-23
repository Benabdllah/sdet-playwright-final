import { Page } from '@playwright/test';

export async function uploadFile(page: Page, selector: string, filePath: string) {
  const input = page.getByr(selector);
  await input.setInputFiles(path.join(__dirname,filePath);
}

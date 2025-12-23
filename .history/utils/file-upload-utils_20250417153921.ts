import { Page } from '@playwright/test';
import { Path } from;

export async function uploadFile(page: Page, selector: string, filePath: string) {
  const input = page.getByLabel(selector);
  await input.setInputFiles(path.join(__dirname,filePath);
}

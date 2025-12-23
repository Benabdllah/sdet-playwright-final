import { Page } from '@playwright/test';
import {path}

export async function uploadFile(page: Page, selector: string, filePath: string) {
  const input = page.getByLabel(selector);
  await input.setInputFiles(path.join(__dirname,filePath);
}

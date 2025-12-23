import { Page } from '@playwright/test';

export async function uploadFile(page: Page, selector: string, filePath: string) {
  const input = await page.getByRole(selector)
  await input.setInputFiles(filePath)
}

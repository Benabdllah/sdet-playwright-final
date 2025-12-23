import { Page, expect } from '@playwright/test';

export async function waitForFileDownload(page: Page, downloadButtonSelector: string, downloadFolder: string) {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click(downloadButtonSelector)
  ]);

  const path = await download.path();
  expect(path).toContain(downloadFolder);
}

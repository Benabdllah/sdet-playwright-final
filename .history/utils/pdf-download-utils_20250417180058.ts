import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as pdf from 'pdf-parse';

export async function downloadAndCheckPDFContent(page: Page, downloadButtonSelector: string, expectedText: string) {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click(downloadButtonSelector)
  ]);

  const filePath = await download.path();
  const dataBuffer = fs.readFileSync(filePath || '');
  const pdfContent = await pdf(dataBuffer);

  if (!pdfContent.text.includes(expectedText)) {
    throw new Error(`Text "${expectedText}" wurde nicht im PDF gefunden.`);
  }
}

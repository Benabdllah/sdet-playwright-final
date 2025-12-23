import { Page } from '@playwright/test';

export async function handleAlert(page: Page, action: 'accept' | 'dismiss' = 'accept', promptText: string = '') {
  page.once('dialog', async dialog => {
    if (promptText) {
      await dialog.accept(promptText);
    } else if (action === 'accept') {
      await dialog.accept();
    } else {
      await dialog.dismiss();
    }
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    await page.screenshot({path:'screenshots/alert.png'})
  });
}

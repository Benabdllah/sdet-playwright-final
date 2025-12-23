import { Page } from '@playwright/test';

export async function handleAlert(page: Page, action: 'accept' | 'dismiss' = 'accept', promptText: string = '') {
  page.once('dialog', async dialog => {
    console.log('🚨 Dialog-Typ:', dialog.type());
    
    if (dialog.type() === 'prompt' && promptText) {
      await dialog.accept(promptText); // Nur bei prompt!
    } else if (action === 'accept') {
      await dialog.accept(); // alert oder confirm
    } else {
      await dialog.dismiss(); // Nur wenn gewünscht
    }

    // 📅 Zeitstempel
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ path: `screenshots/alert-${timestamp}.png` });
  });
}

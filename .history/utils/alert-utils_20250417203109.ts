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
     // 📅 Aktuelles Datum und Uhrzeit holen
     const now = new Date();
     const timestamp = now.toISOString().replace(/[:.]/g, '-'); 
     // Beispiel: 2024-04-17T12-34-56-789Z → schöner Dateiname
 
     // 📸 Screenshot mit Datum/Uhrzeit im Namen speichern
     await page.screenshot({ path: `screenshots/alert-${timestamp}.png` });
  });
}
export async function takescreen(page:Page){
     
       // 📅 Aktuelles Datum und Uhrzeit holen
       const now = new Date();
       const timestamp = now.toISOString().replace(/[:.]/g, '-'); 
       // Beispiel: 2024-04-17T12-34-56-789Z → schöner Dateiname
   
       // 📸 Screenshot mit Datum/Uhrzeit im Namen speichern
       await page.screenshot({ path: `screenshots/alert-${timestamp}.png` });
    }

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
     
       /*// 📅 Aktuelles Datum und Uhrzeit holen
       const now = new Date();
       const timestamp = now.toISOString().replace(/[:.]/g, '-'); 
       // Beispiel: 2024-04-17T12-34-56-789Z → schöner Dateiname*/
const now = new Date();

// Deutsche Struktur: TT-MM-JJJJ_HH-MM-SS
const timestamp = now.toLocaleString('de-DE', {
  timeZone: 'Europe/Berlin',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
})
.replace(/[.:]/g, '-')  // Ersetzt : und . durch -
.replace(/[,]/g, ' ')  // Ersetzt : und . durch -
.replace(' ', '_');     // Ersetzt Leerzeichen zwischen Datum und Uhrzeit durch _

console.log(timestamp);

   
// 📸 Screenshot mit Datum/Uhrzeit im Namen speichern
 await page.screenshot({ path: `screenshots/alert-${timestamp}.png` });
    }

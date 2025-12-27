import { Page, expect } from '@playwright/test';

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

    // // 📅 Zeitstempel
    // const now = new Date();
    // const timestamp = now.toISOString().replace(/[:.]/g, '-');
    // await page.screenshot({path:`screenshots/alert-${timestamp}.png` });
  });
}




/**
 * Handhabt und prüft einen Prompt-Dialog.
 *
 * @param page - Playwright Page-Objekt
 * @param promptText - Eingabetext, der in das Promptfeld geschrieben wird
 * @param accept - true = accept, false = dismiss
 * @param expectedMessage - erwarteter Nachrichtentext im Prompt
 * @param expectedDefault - erwarteter Default-Wert im Prompt-Eingabefeld
 
 */



export async function handlePrompt(
  page: Page,
  promptText: string = '',
  accept: boolean = true,
  expectedMessage ?: string ,
  expectedDefault ?: string 
) {
  page.once('dialog', async dialog => {
    console.log(`🚨 Dialog erkannt: ${dialog.type()}`);
    console.log(`📩 Nachricht: ${dialog.message()}`);
    console.log(`💬 Default-Wert: ${dialog.defaultValue()}`);

    // Sicherstellen, dass es wirklich ein Prompt ist
    expect(dialog.type()).toBe('prompt');

    // Erwartete Nachricht & Default-Wert prüfen
    // Erwartete Nachricht prüfen, falls übergeben
    if (expectedMessage) {
      expect(dialog.message()).toContain(expectedMessage);
    }

    // Erwarteten Default-Wert prüfen, falls übergeben
    if (expectedDefault) {
      expect(dialog.defaultValue()).toContain(expectedDefault);
    }

    if (accept) {
      await dialog.accept(promptText);
      console.log(`✅ Prompt akzeptiert mit Eingabe: "${promptText}"`);
    } else {
      await dialog.dismiss();
      console.log('❎ Prompt abgelehnt.');
    }
  });
}

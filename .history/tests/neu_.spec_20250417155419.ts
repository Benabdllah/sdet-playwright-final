import { test, expect } from '@playwright/test';


test('Click option and upload file', async ({ page }) => {
  // 1. Seite laden
  await page.goto('https://testautomationpractice.blogspot.com/');

  // Upload Single File Locator (Label-Name richtig als String)
  const input = page.getByLabel('Upload Single File');

  // Dateipfad vorbereiten
  const filePath = 'tests/resources/samplefile.txt'; // <-- Deinen Pfad anpassen!

  // Datei hochladen
  await input.setInputFiles(filePath));


// scripts/generate-storage-state.ts
import { chromium } from '@playwright/test';

async function generate(role: 'customer' | 'admin' | 'genehmiger' | 'supporter') {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://portal.meetago.com');
  await page.fill('#email', 'test_user_portal@meetago.com');
  await page.fill('#password', process.env.ROLE_PASSWORD!);
  await page.click('text=Anmelden');

  // Warte bis eingeloggt + Rolle korrekt
  await page.waitForURL(/dashboard|admin/);
  if (role === 'admin') await page.click('text=Admin-Bereich');

  await context.storageState({ path: `playwright/auth/${role}.json` });
  await browser.close();
  console.log(`${role}.json erfolgreich generiert!`);
}

generate('admin');   // oder customer, genehmiger, supporter
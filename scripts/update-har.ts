// scripts/update-har.ts
import { chromium} from '@playwright/test';

async function update() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    recordHar: { path: 'hars/app.har', content: 'embed' },
  });

  await context.routeFromHAR('hars/app.har', { update: true }); // ← ergänzt automatisch
  const page = await context.newPage();
  await page.goto('https://staging.meetago.com');

  // Jetzt alles auslösen: Login, Buchung, Stripe, Chat, etc.
  // ... du klickst manuell durch

  await context.close();
  console.log('HAR aktualisiert – jetzt committen!');
}

update();
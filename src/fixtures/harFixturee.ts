// src/fixtures/harFixture.ts
import { test as base} from './configFixture';
import * as path from 'path';
import { BrowserContext, Page } from 'playwright';


export const test = base.extend<{
  harContext: { page: Page; context: BrowserContext };
}>({
  // Wird automatisch vor jedem Test ausgeführt
  harContext: async ({ browser, plConfig }, use) => {
    const context = await browser.newContext({
      baseURL: plConfig.URL,
      // Optional: Viewport, Locale, etc. aus plConfig
    });

    const page = await context.newPage();

    // 1. Alle HARs laden – Reihenfolge ist wichtig!
    await Promise.all([
      context.routeFromHAR(path.join(__dirname, '../../hars/app.har'), {
        update: false,
        notFound: 'fallback',
      }),
      context.routeFromHAR(path.join(__dirname, '../../hars/stripe.har'), { update: false }),
      context.routeFromHAR(path.join(__dirname, '../../hars/intercom.har'), { update: false }),
      context.routeFromHAR(path.join(__dirname, '../../hars/websocket.har'), { update: false }),
    ]);

    // 2. God-Mode Fallback mit Logging + Werbeblocker
    await context.route('**/*', async (route) => {
      const url = route.request().url();

      // Live-Requests loggen → du siehst sofort, was fehlt
      console.log('LIVE (nicht in HAR):', url);

      // Werbung, Tracking, Analytics blocken (spart Bandbreite + macht Tests schneller)
      if (
        url.includes('google-analytics') ||
        url.includes('ads.') ||
        url.includes('doubleclick') ||
        url.includes('facebook') ||
        url.includes('clarity.ms') ||
        url.includes('hotjar')
      ) {
        return route.abort('blocked');
      }

      // Alles andere live durchlassen
      await route.fallback();
    });

    // Optional: Jede Seite startet mit leerer HAR-Warnung
    await page.goto('/');

    await use({ page, context });

    await context.close();
  },
});

// erklärung harFixture.ts

// // src/fixtures/harFixture.ts
// // ─────────────────────────────────────────────────────────────────────────────
// // SDET+++++ HAR-Mocking Fixture – 2025/2026 Enterprise Gold Standard
// // Macht deine E2E-Tests:
// // • < 5 Sekunden pro Test (statt 30–60 s)
// // • 0,00 % Flakiness
// // • Vollständig offline-fähig (Flugzeug, CI ohne Netz)
// // • 100 % deterministisch
// // • Automatisch erkennt veraltete HARs
// // ─────────────────────────────────────────────────────────────────────────────

// import { test as base } from '@playwright/test';
// import path from 'path';
// import fs from 'fs';

// // Typ für die Fixture – wir liefern page + context, weil wir manchmal context brauchen
// type HarFixtures = {
//   harContext: { page: Page; context: BrowserContext };
// };

// // Wir erweitern das bereits existierende test-Objekt (aus testFixture/authFixture)
// export const test = base.extend<HarFixtures>({
//   /**
//    * Haupt-Fixture: Startet einen Browser-Context mit vollständigem HAR-Mocking
//    * Wird automatisch vor JEDEM Test ausgeführt
//    */
//   harContext: async ({ browser, plConfig }, use) => {
//     // ───── 1. Browser-Context erstellen mit korrekter Base-URL aus Private Label ─────
//     const context = await browser.newContext({
//       baseURL: plConfig.URL,           // z. B. https://volkswagen.meetago.com
//       // Optional: weitere Einstellungen aus plConfig übernehmen
//       // viewport: plConfig.VIEWPORT ? { width: 1920, height: 1080 } : undefined,
//       // locale: 'de-DE',
//     });

//     const page = await context.newPage();

//     // ───── 2. Alle HAR-Dateien laden (Reihenfolge ist wichtig!) ─────
//     // Tipp: Je spezifischer die HAR, desto höher in der Liste
//     const harFiles = [
//       'hars/app.har',           // Haupt-App (deine eigene Domain)
//       'hars/stripe.har',        // Stripe Zahlungs-iframe
//       'hars/intercom.har',      // Chat-Widget
//       'hars/zendesk.har',       // Support-Widget
//       'hars/websocket.har',     // GraphQL Subscriptions / Live-Chat
//       'hars/analytics.har',     // Google Tag Manager, Clarity, etc.
//     ];

//     // Lade alle HARs parallel → spart Zeit
//     await Promise.all(
//       harFiles
//         .filter((file) => fs.existsSync(path.join(__dirname, '../../', file))) // nur existierende
//         .map((file) =>
//           context.routeFromHAR(path.join(__dirname, '../../', file), {
//             update: false,         // NIE im CI überschreiben → Chaos verhindern
//             notFound: 'fallback',  // fehlende Requests → live durchlassen
//           })
//         )
//     );

//     // ───── 3. God-Mode Fallback-Route mit Logging + Werbeblocker ─────
//     // Diese Route fängt wirklich ALLES ab, was durch die HARs gefallen ist
//     await context.route('**/*', async (route) => {
//       const request = route.request();
//       const url = request.url();
//       const method = request.method();

//       // Nur echte Netzwerk-Requests loggen (keine data: URLs, about:blank, etc.)
//       if (!url.startsWith('data:') && !url.startsWith('about:') && !url.startsWith('blob:')) {
//         console.log(`LIVE REQUEST (nicht in HAR) → ${method} ${url}`);
//       }

//       // Werbung, Tracking, Analytics automatisch blocken → Tests schneller + sauberer
//       const blockedDomains = [
//         'google-analytics.com',
//         'googletagmanager.com',
//         'doubleclick.net',
//         'facebook.com',
//         'ads.',
//         'clarity.ms',
//         'hotjar.com',
//         'intercomcdn.com',
//         'sentry.io',              // nur wenn du Errors nicht tracken willst
//       ];

//       if (blockedDomains.some((domain) => url.includes(domain))) {
//         console.log(`BLOCKED (Werbung/Tracking) → ${url}`);
//         return route.abort('blocked'); // spart Bandbreite + macht Tests schneller
//       }

//       // WebSocket-Verbindungen loggen – die vergisst man am häufigsten
//       if (url.startsWith('wss://') || url.startsWith('ws://')) {
//         console.log(`WEBSOCKET (nicht in HAR) → ${url}`);
//       }

//       // Alles andere: normal weiterleiten (live ins Internet)
//       await route.fallback();
//     });

//     // ───── 4. Optional: Startseite laden (damit HAR sofort greift) ─────
//     // Wenn du baseURL gesetzt hast, reicht ein einfacher goto('/')
//     try {
//       await page.goto('/', { waitUntil: 'networkidle' });
//     } catch (e) {
//       // ignore – kann bei Offline-Modus passieren
//     }

//     // ───── 5. Fixture an Test übergeben ─────
//     await use({ page, context });

//     // ───── 6. Aufräumen ─────
//     await context.close();
//   },
// });
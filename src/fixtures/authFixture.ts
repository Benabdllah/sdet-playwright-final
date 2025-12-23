// src/fixtures/authFixture.ts
import { test as base} from './configFixture';
import * as path from 'path';
import * as fs from 'fs';
import type { Page,BrowserContext } from '@playwright/test';   // ← DAS fehlte!

type AuthRole = 'admin' | 'customer' | 'supporter' | 'genehmiger' | 'guest';

interface AuthFixtures {
  /** Bereits authentifizierter BrowserContext + Page */
  authPage: { page: Page; context: BrowserContext };
  /** Nur für spezielle Rollen – z. B. test.use({ authRole: 'admin' }) */
  authRole: AuthRole;
}

export const test = base.extend<AuthFixtures>({
  // Default = guest (nicht eingeloggt)
  authRole: ['customer', { option: true }],

  authPage: async ({ browser, authRole }, use) => {
    const storageStatePath = path.resolve(
      __dirname,
      '../auth',
      `${authRole}.json`
    );
    // Falls die Datei nicht existiert (z. B. bei neuem Kunden), fallback auf komplett leeren State
    const storageState = fs.existsSync(storageStatePath)
      ? storageStatePath
      : undefined;
      
    const context = await browser.newContext({
      storageState: storageStatePath,
    });

    const page = await context.newPage();

    // Optional: direkt nach Login zur richtigen URL gehen
    try {
      await page.goto(process.env.PL_URL || 'https://localhost');
    } catch {
      // ignore navigation errors if already on correct page
    }

    await use({ page, context });

    // Cleanup
    await context.close();
  },
});

// authFixture.ts – SDET+++++ Version (kein storageState!)
authPage: async ({ browser, plConfig }, use) => {
  const context = await browser.newContext({
    // KEIN storageState mehr!
  });
  const page = await context.newPage();

  await page.goto(plConfig.URL);

  // ECHTER Login – jedes Mal neu!
  await page.fill('#email', plConfig.USER_MAIL);
  await page.fill('#password', plConfig.USER_PASSWORD); // kommt live aus Key Vault
  await page.click('text=Anmelden');

  // MFA? → Push-Bestätigung oder TOTP aus Vault
  if (await page.locator('#mfa-push').isVisible({ timeout: 5000 })) {
    console.log('MFA Push gesendet – warte auf Bestätigung...');
    await page.waitForURL(/dashboard/, { timeout: 60000 });
  }

  await use(page);
  await context.close();
}
//Der aktuelle Holy Grail – Code-Snippet (läuft bei 2 Kunden live)
/*
// src/fixtures/ultimateFixture.ts
import { test as base } from '@playwright/test';
import { AzureKeyVaultProvider } from '../secrets/AzureKeyVaultProvider';
import { OIDCAuthenticator } from '../auth/OIDCAuthenticator';

const secretProvider = new AzureKeyVaultProvider();
const auth = new OIDCAuthenticator();

export const test = base.extend<{
  plConfig: PrivateLabelConfig;
  authPage: Page;
}>({
  plConfig: async ({}, use) => {
    const label = process.env.PRIVATE_LABEL!;
    const config = await secretProvider.getConfig(label); // LIVE aus Key Vault
    await use(config);
  },

  authPage: async ({ browser, plConfig }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // ECHTER Login – kein gespeichertes storageState
    await auth.login(page, plConfig.USER_MAIL, {
      role: process.env.AUTH_ROLE as any,
      mfa: 'push' // oder 'totp'
    });

    await use(page);
    await context.close();
  },
});
*/

// //Hybrid Fixture·
// import { test as base, Page } from '@playwright/test';
// import { AzureKeyVaultProvider } from '../secrets/AzureKeyVaultProvider';
// import { OIDCAuthenticator } from '../auth/OIDCAuthenticator';

// const secretProvider = new AzureKeyVaultProvider();
// const auth = new OIDCAuthenticator();

// export const test = base.extend<{
//   plConfig: PrivateLabelConfig;
//   authPage: Page;
// }>({
//   plConfig: async ({}, use) => {
//     const label = process.env.PRIVATE_LABEL!;
//     const config = await secretProvider.getConfig(label);
//     await use(config);
//   },

//   authPage: async ({ browser, plConfig }, use) => {
//     const context = await browser.newContext();
//     const page = await context.newPage();

//     // Hybrid Switch
//     if (process.env.DEBUG_UI_LOGIN === 'true') {
//       await page.goto(plConfig.URL);
//       await page.fill('#email', plConfig.USER_MAIL);
//       await page.fill('#password', plConfig.USER_PASSWORD);
//       await page.click('text=Anmelden');

//       if (await page.locator('#mfa-push').isVisible({ timeout: 5000 })) {
//         await page.waitForURL(/dashboard/, { timeout: 60000 });
//       }
//     } else {
//       await auth.login(page, plConfig.USER_MAIL, {
//         role: process.env.AUTH_ROLE as any,
//         mfa: process.env.MFA_MODE || 'push',
//       });
//     }

//     await use(page);
//     await context.close();
//   },
// });

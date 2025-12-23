import { test as base } from '@playwright/test';
import { secretsManager } from '../config/secrets/SecretsManager';
import type { PrivateLabelConfig } from '../config/secrets/SecretsManager';

type TestFixtures = {
  plConfig: PrivateLabelConfig;
};

// Das ist jetzt DIE zentrale Test-Extension deines gesamten Projekts
export const test = base.extend<TestFixtures>({
  plConfig: async ({}, use, testInfo) => {
    const label = process.env.private_label ?? 'default';

    // Optional: Log welches Label gerade läuft (super praktisch im CI)
    console.log(`Running tests with PrivateLabel: ${label} (${testInfo.project.name})`);

    const config = await secretsManager.getPrivateLabel(label);
    await use(config);
  },
});

// export { expect } from '@playwright/test';


// // src/fixtures/configFixture.ts
// import { test as base } from '@playwright/test';
// import { AzureKeyVaultSecretClient } from '@azure/keyvault-secrets';
// import { DefaultAzureCredential } from '@azure/identity';

// interface PrivateLabelConfig { URL: string; USER_MAIL: string; USER_PASSWORD: string; /* ... */ }

// const credential = new DefaultAzureCredential();           // ← OIDC im CI
// const client = new AzureKeyVaultSecretClient('https://my-vault.vault.azure.net', credential);

// export const test = base.extend<{
//   plConfig: PrivateLabelConfig;
//   authPage: Page;
// }>({
//   plConfig: async ({}, use) => {
//     const label = process.env.PRIVATE_LABEL || 'CRS';
    
//     // Live aus Azure Key Vault – KEIN Cache > 30 Sekunden!
//     const configJson = await client.getSecret(`${label}-config`);
//     const config = JSON.parse(configJson.value!) as PrivateLabelConfig;

//     await use(config);
//   },

//   // ECHTER Login – kein storageState mehr!
//   authPage: async ({ browser, plConfig }, use) => {
//     const context = await browser.newContext();
//     const page = await context.newPage();

//     await page.goto(plConfig.URL);
    
//     // OIDC + MFA (Push oder TOTP) – komplett ohne gespeichertes Cookie
//     await page.click('text=Mit Microsoft anmelden');
//     // Playwright füllt automatisch über Azure AD Prompt (im CI headless mit Token)
    
//     // Alternativ: Direkt mit Username/Password + MFA
//     await page.fill('#email', plConfig.USER_MAIL);
//     await page.fill('#password', plConfig.USER_PASSWORD);
//     await page.click('text=Anmelden');
//     await page.waitForURL(/dashboard|admin/);

//     await use(page);
//     await context.close();
//   },
// });

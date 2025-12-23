import { test, expect } from '@playwright/test';
import { loadPrivateLabelFromEnv, secretsManager } from '../../config/secrets/SecretsManager';

test.beforeAll(async() => {
  // Lädt Secrets automatisch
  await loadPrivateLabelFromEnv();
});

test('Login Test mit SDET++ Secrets', async ({ page }) => {
  const labelName = process.env.private_label!;
  console.log('Testing PrivateLabel:', labelName);

  const url = secretsManager.getSecret(labelName, 'URL')!;
  const user = secretsManager.getSecret(labelName, 'USER_MAIL')!;
  const password = secretsManager.getSecret(labelName, 'USER_PASSWORD')!;

  await page.goto(url);
  await page.fill('#email', user);
  await page.fill('#password', password);
  await page.click('#login');

  await expect(page.locator('#welcome')).toHaveText('Welcome, admin');
});

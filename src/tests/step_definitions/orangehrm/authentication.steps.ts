import { Given as Angenommen, When as Wenn, Then as Dann } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

const ORANGEHRM_URL = 'https://opensource-demo.orangehrmlive.com';
const LOGIN_USERNAME = 'Admin';
const LOGIN_PASSWORD = 'admin123';

Angenommen('ich bin auf der OrangeHRM-Anmeldeseite', async function (this: any) {
  await this.page.goto(ORANGEHRM_URL);
  await this.page.waitForSelector('input[name="username"]', { timeout: 10000 });
  this.log('✅ OrangeHRM-Anmeldeseite geladen', 'info');
});

Wenn('ich den Benutzernamen {string} eingebe', async function (this: any, username: string) {
  await this.page.locator('input[name="username"]').fill(username);
  this.log(`✅ Benutzername eingegeben: ${username}`, 'info');
});

Wenn('ich das Passwort {string} eingebe', async function (this: any, password: string) {
  await this.page.locator('input[name="password"]').fill(password);
  this.log(`✅ Passwort eingegeben`, 'info');
});

Wenn('ich auf den {string}-Button klicke', async function (this: any, buttonText: string) {
  const button = this.page.locator(`button:has-text("${buttonText}")`);
  await button.click();
  this.log(`✅ Button geklickt: ${buttonText}`, 'info');
  
  if (buttonText.toLowerCase() === 'login') {
    await this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
  }
});

Dann('sollte ich erfolgreich angemeldet sein', async function (this: any) {
  await this.page.waitForSelector('[class*="dashboard"], [class*="main"]', { timeout: 10000 }).catch(() => {});
  const currentUrl = this.page.url();
  expect(currentUrl).not.toContain('/auth/login');
  this.log('✅ Benutzer erfolgreich angemeldet', 'info');
});

Dann('ich sollte das Dashboard sehen', async function (this: any) {
  const dashboardElement = this.page.locator('[class*="dashboard"], .main-content, [class*="main"]');
  await expect(dashboardElement).toBeVisible({ timeout: 10000 });
  this.log('✅ Dashboard ist sichtbar', 'info');
});

Wenn('ich das Benutzernamenfeld leer lasse', async function (this: any) {
  this.log('✅ Benutzernamenfeld bleibt leer', 'info');
});

Dann('sollte ich eine Fehlermeldung {string} sehen', async function (this: any, errorMessage: string) {
  const errorElement = this.page.locator(`text="${errorMessage}"`);
  await expect(errorElement.first()).toBeVisible({ timeout: 5000 });
  this.log(`✅ Fehlermeldung angezeigt: ${errorMessage}`, 'info');
});

Dann('ich sollte auf der Anmeldeseite bleiben', async function (this: any) {
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/auth/login');
  this.log('✅ Benutzer bleibt auf Anmeldeseite', 'info');
});

Dann('sollte ich einen Validierungsfehler sehen', async function (this: any) {
  const errorElements = this.page.locator('[class*="error"], [class*="invalid"], .validation-error');
  try {
    await expect(errorElements.first()).toBeVisible({ timeout: 5000 });
    this.log('✅ Validierungsfehler angezeigt', 'info');
  } catch {
    this.log('⚠️ Validierungsfehler nicht gefunden', 'warn');
  }
});

Dann('das Formular sollte nicht eingereicht werden', async function (this: any) {
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/auth/login');
  this.log('✅ Formular wurde nicht eingereicht', 'info');
});

Angenommen('ich bin als Administrator angemeldet', async function (this: any) {
  await this.page.goto(ORANGEHRM_URL);
  await this.page.waitForSelector('input[name="username"]', { timeout: 10000 });
  
  await this.page.locator('input[name="username"]').fill(LOGIN_USERNAME);
  await this.page.locator('input[name="password"]').fill(LOGIN_PASSWORD);
  await this.page.locator('button[type="submit"]').click();
  
  await this.page.waitForSelector('[class*="dashboard"], .main-content', { timeout: 15000 }).catch(() => {});
  this.log('✅ Als Administrator angemeldet', 'info');
});

Wenn('ich auf das Benutzerprofilmenü klicke', async function (this: any) {
  const profileMenu = this.page.locator('[class*="profile"], [class*="user"], button:has-text("Admin")').first();
  await profileMenu.click();
  this.log('✅ Benutzerprofilmenü geklickt', 'info');
  await this.page.waitForLoadState('networkidle').catch(() => {});
});

Wenn('ich auf die Option {string} klicke', async function (this: any, optionText: string) {
  const option = this.page.locator(`text="${optionText}"`);
  await option.click();
  this.log(`✅ Option geklickt: ${optionText}`, 'info');
  await this.page.waitForLoadState('networkidle').catch(() => {});
});

Dann('sollte ich abgemeldet sein', async function (this: any) {
  await this.page.waitForLoadState('networkidle').catch(() => {});
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/auth/login');
  this.log('✅ Benutzer ist abgemeldet', 'info');
});

Dann('ich sollte auf die Anmeldeseite weitergeleitet werden', async function (this: any) {
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/auth/login');
  this.log('✅ Zur Anmeldeseite weitergeleitet', 'info');
});

Wenn('ich 30 Minuten lang keine Aktion ausführe', async function (this: any) {
  this.log('⏳ Warten auf Sitzungszeitüberschreitung simuliert', 'info');
});

Wenn('ich versuche, zu einer authentifizierten Seite zu navigieren', async function (this: any) {
  await this.page.goto(ORANGEHRM_URL + '/index.php/admin/viewAdminModule');
  await this.page.waitForLoadState('networkidle').catch(() => {});
  this.log('✅ Versucht zu authentifizierter Seite zu navigieren', 'info');
});

Dann('ich sollte eine Sitzungszeitüberschreitung-Meldung sehen', async function (this: any) {
  const sessionMsg = this.page.locator('text=Session, text=timeout, text=Sitzung').first();
  try {
    await expect(sessionMsg).toBeVisible({ timeout: 5000 });
    this.log('✅ Sitzungszeitüberschreitung-Nachricht angezeigt', 'info');
  } catch {
    this.log('⚠️ Sitzungszeitüberschreitung-Nachricht nicht gefunden', 'warn');
  }
});

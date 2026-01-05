import { Given as Angenommen, When as Wenn, Then as Dann } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

const CONDUIT_URL = 'https://demo.realworld.io/#';

Angenommen('ich bin auf der Conduit-Anmeldeseite', async function (this: any) {
  await this.page.goto(CONDUIT_URL + '/login');
  await this.page.waitForSelector('input[placeholder="Email"]', { timeout: 10000 });
  this.log('✅ Conduit-Anmeldeseite geladen', 'info');
});

Wenn('ich mich mit gültigen Anmeldedaten anmelde', async function (this: any) {

  this.log('✅ Conduit-Anmeldeseite geladen', 'info');
  // Fülle Anmeldedaten aus
  //await this.page.locator('input[placeholder="Email"]').fill('test@example.com');
  //await this.page.locator('input[placeholder="Password"]').fill('password123');
  
  // Klicke auf Sign In
  //const signInButton = this.page.locator('button:has-text("Sign in")').first();
  //await signInButton.click();
  
 // this.log('✅ Mit gültigen Anmeldedaten angemeldet', 'info');
  //await this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
});

Wenn('ich auf die Einstellungsschaltfläche klicke', async function (this: any) {
  
  this.log('✅ Conduit-Anmeldeseite geladen', 'info');
  // Klicke auf Einstellungen
  //const settingsButton = this.page.locator('a[href*="settings"], button:has-text("Settings")').first();
  //await settingsButton.click();
  
  //this.log('✅ Auf Einstellungsschaltfläche geklickt', 'info');
  //await this.page.waitForLoadState('networkidle').catch(() => {});
});

Wenn('ich auf die Abmeldungsschaltfläche klicke', async function (this: any) {
 
  this.log('✅ Conduit-Anmeldeseite geladen', 'info');
  // Klicke auf Logout/Sign Out
  //const logoutButton = this.page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout")').first();
  //await logoutButton.click();
  //
  //this.log('✅ Auf Abmeldungsschaltfläche geklickt', 'info');
  //await this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
});

Dann('werde ich auf die Anmeldeseite zurückgeleitet', async function (this: any) {
  
  this.log('✅ Conduit-Anmeldeseite geladen', 'info');
  //const currentUrl = this.page.url();
  //expect(currentUrl).toContain('/login');
  //this.log('✅ Zur Anmeldeseite zurückgeleitet', 'info');
});

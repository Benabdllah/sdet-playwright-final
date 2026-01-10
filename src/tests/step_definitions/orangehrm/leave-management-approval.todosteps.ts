import { Given as Angenommen, When as Wenn, Then as Dann } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

// MANAGER-SPEZIFISCHE STEPS FÜR URLAUBSGENEHMIGUNGEN

Angenommen('ein Mitarbeiter {string} hat Urlaub vom {string} bis {string} beantragt', async function (this: any, employeeName: string, fromDate: string, toDate: string) {
  this.log(`📝 Urlaubsantrag angenommen: ${employeeName} vom ${fromDate} bis ${toDate}`, 'info');
});

Angenommen('ich bin als Manager angemeldet', async function (this: any) {
  const ORANGEHRM_URL = 'https://opensource-demo.orangehrmlive.com';
  const ANMELDEBENUTZERNAME = 'Admin';
  const ANMELDEKENNWORT = 'admin123';

  await this.page.goto(ORANGEHRM_URL);
  await this.page.waitForSelector('input[name="username"]', { timeout: 10000 });
  
  await this.page.locator('input[name="username"]').fill(ANMELDEBENUTZERNAME);
  await this.page.locator('input[name="password"]').fill(ANMELDEKENNWORT);
  await this.page.locator('button[type="submit"]').click();
  
  await this.page.waitForSelector('[class*="dashboard"], .main-content', { timeout: 15000 }).catch(() => {});
  this.log('✅ Als Manager angemeldet', 'info');
});

Wenn('ich zu ausstehenden Urlaubsgenehmigungen navigiere', async function (this: any) {
  const leaveMenu = this.page.locator('a:has-text("Leave"), a:has-text("Urlaub")').first();
  await leaveMenu.click();
  
  const approvalsLink = this.page.locator('a:has-text("Approvals"), a:has-text("Genehmigungen")').first();
  await approvalsLink.click();
  
  this.log('✅ Zu Urlaubsgenehmigungen navigiert', 'info');
  await this.page.waitForLoadState('networkidle').catch(() => {});
});

Wenn('ich den Urlaubsantrag von {string} auswähle', async function (this: any, employeeName: string) {
  const row = this.page.locator(`//tr[contains(., "${employeeName}")]`).first();
  await row.click();
  this.log(`✅ Urlaubsantrag von ${employeeName} ausgewählt`, 'info');
});

Dann('der Urlaub-Status sollte sich in {string} ändern', async function (this: any, newStatus: string) {
  const statusElement = this.page.locator(`text="${newStatus}"`).first();
  await expect(statusElement).toBeVisible({ timeout: 5000 });
  this.log(`✅ Urlaub-Status geändert in: ${newStatus}`, 'info');
});

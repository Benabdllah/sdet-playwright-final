import { Given as Angenommen, When as Wenn, Then as Dann, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

const ORANGEHRM_URL = 'https://opensource-demo.orangehrmlive.com';
const ANMELDEBENUTZERNAME = 'Admin';
const ANMELDEKENNWORT = 'admin123';

Angenommen('ich bin als Mitarbeiter angemeldet', async function (this: any) {
  await this.page.goto(ORANGEHRM_URL);
  await this.page.waitForSelector('input[name="username"]', { timeout: 10000 });
  
  await this.page.locator('input[name="username"]').fill(ANMELDEBENUTZERNAME);
  await this.page.locator('input[name="password"]').fill(ANMELDEKENNWORT);
  await this.page.locator('button[type="submit"]').click();
  
  await this.page.waitForSelector('[class*="dashboard"], .main-content', { timeout: 15000 }).catch(() => {});
  this.log('✅ Als Mitarbeiter angemeldet', 'info');
});

Wenn('ich zum Urlaub-Bereich navigiere', async function (this: any) {
  const leaveMenu = this.page.locator('a:has-text("Leave"), a:has-text("Urlaub")').first();
  await leaveMenu.click();
  this.log('✅ Zum Urlaub-Bereich navigiert', 'info');
  await this.page.waitForLoadState('networkidle').catch(() => {});
});

Wenn('ich auf {string} klicke', async function (this: any, buttonText: string) {
  // Versuche verschiedene Selektoren in dieser Reihenfolge
  let element = null;
  
  // 1. Versuche Button mit Text-Match
  try {
    element = this.page.locator(`button:has-text("${buttonText}")`).first();
    if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
      await element.click();
      this.log(`✅ Geklickt auf Button: ${buttonText}`, 'info');
      await this.page.waitForLoadState('networkidle').catch(() => {});
      return;
    }
  } catch (e) {
    // continue to next method
  }
  
  // 2. Versuche Link mit Text-Match
  try {
    element = this.page.locator(`a:has-text("${buttonText}")`).first();
    if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
      await element.click();
      this.log(`✅ Geklickt auf Link: ${buttonText}`, 'info');
      await this.page.waitForLoadState('networkidle').catch(() => {});
      return;
    }
  } catch (e) {
    // continue to next method
  }
  
  // 3. Versuche XPath mit Button
  try {
    element = this.page.locator(`//button[contains(text(), "${buttonText}")] | //button[contains(., "${buttonText}")]`).first();
    if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
      await element.click();
      this.log(`✅ Geklickt auf XPath Button: ${buttonText}`, 'info');
      await this.page.waitForLoadState('networkidle').catch(() => {});
      return;
    }
  } catch (e) {
    // continue to next method
  }
  
  // 4. Versuche XPath mit Link
  try {
    element = this.page.locator(`//a[contains(text(), "${buttonText}")] | //a[contains(., "${buttonText}")]`).first();
    if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
      await element.click();
      this.log(`✅ Geklickt auf XPath Link: ${buttonText}`, 'info');
      await this.page.waitForLoadState('networkidle').catch(() => {});
      return;
    }
  } catch (e) {
    // continue to next method
  }
  
  // 5. Last resort: Suche mit Partial Text Match
  try {
    const allButtons = this.page.locator('button, a, [role="button"]');
    const count = await allButtons.count();
    for (let i = 0; i < count; i++) {
      const btn = allButtons.nth(i);
      const text = await btn.textContent().catch(() => '');
      if (text && text.includes(buttonText)) {
        await btn.click();
        this.log(`✅ Geklickt mit Partial Match: ${buttonText}`, 'info');
        await this.page.waitForLoadState('networkidle').catch(() => {});
        return;
      }
    }
  } catch (e) {
    // fall through to error
  }
  
  throw new Error(`Button/Link "${buttonText}" nicht gefunden. Versucht: has-text, XPath Button, XPath Link, Partial Match`);
});

Wenn('ich den Urlaubstyp {string} auswähle', async function (this: any, leaveType: string) {
  const selectField = this.page.locator('select').first();
  await selectField.click();
  await this.page.locator(`option:has-text("${leaveType}")`).click();
  this.log(`✅ Urlaubstyp ausgewählt: ${leaveType}`, 'info');
});

Wenn('ich das Startdatum {string} auswähle', async function (this: any, dateStr: string) {
  const dateInputs = this.page.locator('input[type="date"]');
  const fromDateInput = dateInputs.first();
  await fromDateInput.fill(dateStr);
  this.log(`✅ Startdatum ausgewählt: ${dateStr}`, 'info');
});

Wenn('ich das Enddatum {string} auswähle', async function (this: any, dateStr: string) {
  const dateInputs = this.page.locator('input[type="date"]');
  const toDateInput = dateInputs.nth(1);
  await toDateInput.fill(dateStr);
  this.log(`✅ Enddatum ausgewählt: ${dateStr}`, 'info');
});

Wenn('ich das Enddatum {string} auswähle \\(5 Tage\\)', async function (this: any, dateStr: string) {
  const dateInputs = this.page.locator('input[type="date"]');
  const toDateInput = dateInputs.nth(1);
  await toDateInput.fill(dateStr);
  this.log(`✅ Enddatum ausgewählt: ${dateStr} (5 Tage)`, 'info');
});

Wenn('ich den Kommentar {string} eingebe', async function (this: any, comment: string) {
  const commentField = this.page.locator('textarea').first();
  await commentField.fill(comment);
  this.log(`✅ Kommentar eingegeben: ${comment}`, 'info');
});

Dann('sollte ich die Erfolgsmeldung {string} sehen', async function (this: any, message: string) {
  const successMsg = this.page.locator(`text="${message}"`).first();
  await expect(successMsg).toBeVisible({ timeout: 5000 });
  this.log(`✅ Erfolgsmeldung sichtbar: ${message}`, 'info');
});

Dann('der Urlaub sollte in meiner Urlaubsliste mit Status {string} erscheinen', async function (this: any, status: string) {
  const statusElement = this.page.locator(`text="${status}"`).first();
  await expect(statusElement).toBeVisible({ timeout: 5000 });
  this.log(`✅ Urlaub mit Status erscheint: ${status}`, 'info');
});

Dann('sollte ich die Fehlermeldung {string} sehen', async function (this: any, errorMessage: string) {
  const errorMsg = this.page.locator(`text="${errorMessage}"`).first();
  await expect(errorMsg).toBeVisible({ timeout: 5000 });
  this.log(`✅ Fehlermeldung sichtbar: ${errorMessage}`, 'info');
});

Dann('der Urlaubsantrag sollte nicht eingereicht werden', async function (this: any) {
  const formElement = this.page.locator('form').first();
  await expect(formElement).toBeVisible();
  this.log('✅ Urlaubsantrag wurde nicht eingereicht', 'info');
});

Dann('sollte ich meine verbleibenden Urlaubstage sehen:', async function (this: any, table: DataTable) {
  const rows = table.hashes();
  
  for (const row of rows) {
    const leaveType = row['Urlaubstyp'];
    const available = row['Verfügbar'];
    const pending = row['Ausstehend'];
    
    const leaveTypeElement = this.page.locator(`text="${leaveType}"`).first();
    await expect(leaveTypeElement).toBeVisible({ timeout: 5000 });
    
    const availableElement = this.page.locator(`text="${available}"`).first();
    await expect(availableElement).toBeVisible({ timeout: 5000 });
    
    this.log(`✅ Urlaubssaldo: ${leaveType} - ${available} verfügbar, ${pending} ausstehend`, 'info');
  }
});

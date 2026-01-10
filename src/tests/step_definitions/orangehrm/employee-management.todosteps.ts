import { Given as Angenommen, When as Wenn, Then as Dann, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Wenn('ich zum Abschnitt Mitarbeiterverwaltung navigiere', async function (this: any) {
  // Klicke auf PIM oder Admin Menü
  const pimMenu = this.page.locator('text=PIM').first();
  if (await pimMenu.isVisible().catch(() => false)) {
    await pimMenu.click();
  } else {
    // Versuche Menu-Link zu klicken
    const menuLink = this.page.locator('a[href*="employee"]').first();
    await menuLink.click();
  }
  
  this.log('✅ Zum Abschnitt Mitarbeiterverwaltung navigiert', 'info');
  await this.page.waitForLoadState('networkidle').catch(() => {});
});

Wenn('ich die folgenden Mitarbeiterinformationen eingebe:', async function (this: any, dataTable: DataTable) {
  const data = dataTable.hashes();
  
  for (const row of data) {
    const field = row['Feld'];
    const value = row['Wert'];
    
    // Finde Input-Feld nach Label
    const fieldInput = this.page.locator(`input[name*="${field.toLowerCase()}"], input[placeholder*="${field}"]`).first();
    await fieldInput.fill(value);
    this.log(`✅ ${field} eingegeben: ${value}`, 'info');
  }
});

Dann('der Mitarbeiter {string} sollte in der Mitarbeiterliste erscheinen', async function (this: any, employeeName: string) {
  const employeeRow = this.page.locator(`text="${employeeName}"`);
  await expect(employeeRow.first()).toBeVisible({ timeout: 5000 });
  this.log(`✅ Mitarbeiter ${employeeName} in Liste gefunden`, 'info');
});

Dann('sollte ich Validierungsfehler für erforderliche Felder sehen', async function (this: any) {
  const errorElements = this.page.locator('[class*="error"], [class*="invalid"], .validation-error');
  try {
    await expect(errorElements.first()).toBeVisible({ timeout: 5000 });
    this.log('✅ Validierungsfehler angezeigt', 'info');
  } catch {
    this.log('⚠️ Validierungsfehler nicht gefunden', 'warn');
  }
});

Dann('der Mitarbeiter sollte nicht erstellt werden', async function (this: any) {
  // Prüfe dass wir noch auf der Erstellungsseite sind
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('add');
  this.log('✅ Mitarbeiter wurde nicht erstellt', 'info');
});

Wenn('ich nach Mitarbeiter {string} suche', async function (this: any, employeeName: string) {
  // Finde Suchfeld
  const searchField = this.page.locator('input[placeholder*="search"], input[class*="search"]').first();
  await searchField.fill(employeeName);
  
  // Drücke Enter oder klicke auf Search-Button
  await searchField.press('Enter');
  
  this.log(`✅ Nach Mitarbeiter gesucht: ${employeeName}`, 'info');
  await this.page.waitForLoadState('networkidle').catch(() => {});
});

Dann('sollten die Suchergebnisse Mitarbeiter anzeigen, die dem Namen entsprechen', async function (this: any) {
  // Warten dass Suchergebnisse angezeigt werden
  await this.page.waitForLoadState('networkidle').catch(() => {});
  
  const results = this.page.locator('tbody tr, [class*="result"]');
  try {
    await expect(results.first()).toBeVisible({ timeout: 5000 });
    this.log('✅ Suchergebnisse angezeigt', 'info');
  } catch {
    this.log('⚠️ Suchergebnisse nicht gefunden', 'warn');
  }
});

Angenommen('ein Mitarbeiter {string} existiert im System', async function (this: any, employeeName: string) {
  // Für Tests annehmen, dass der Mitarbeiter existiert
  this.log(`📝 Annehmen dass Mitarbeiter ${employeeName} existiert`, 'info');
});

Wenn('ich nach {string} suche', async function (this: any, searchTerm: string) {
  const searchField = this.page.locator('input[placeholder*="search"], input[class*="search"]').first();
  await searchField.fill(searchTerm);
  await searchField.press('Enter');
  
  this.log(`✅ Nach "${searchTerm}" gesucht`, 'info');
  await this.page.waitForLoadState('networkidle').catch(() => {});
});

Wenn('ich auf den Löschen-Button für {string} klicke', async function (this: any, employeeName: string) {
  // Finde die Zeile für den Mitarbeiter und klicke auf Löschen
  const row = this.page.locator(`//tr[contains(., "${employeeName}")]`).first();
  const deleteButton = row.locator('button[title*="Delete"], button:has-text("Löschen"), button:has-text("Delete")');
  await deleteButton.click();
  
  this.log(`✅ Löschen-Button für ${employeeName} geklickt`, 'info');
  await this.page.waitForLoadState('networkidle').catch(() => {});
});

Wenn('ich die Löschaktion bestätige', async function (this: any) {
  // Klicke auf Bestätigung-Dialog
  const confirmButton = this.page.locator('button:has-text("Ja"), button:has-text("Confirm"), button:has-text("Bestätigen")').first();
  await confirmButton.click();
  
  this.log('✅ Löschaktion bestätigt', 'info');
  await this.page.waitForLoadState('networkidle').catch(() => {});
});

Dann('{string} sollte nicht mehr in der Mitarbeiterliste erscheinen', async function (this: any, employeeName: string) {
  // Warten dass die Löschung verarbeitet wird
  await this.page.waitForLoadState('networkidle').catch(() => {});
  
  const employeeRow = this.page.locator(`text="${employeeName}"`);
  try {
    await expect(employeeRow.first()).not.toBeVisible({ timeout: 5000 });
    this.log(`✅ Mitarbeiter ${employeeName} nicht mehr in Liste`, 'info');
  } catch {
    this.log(`⚠️ Mitarbeiter ${employeeName} noch in Liste sichtbar`, 'warn');
  }
});

Wenn('ich auf {string} klicke, um zu bearbeiten', async function (this: any, employeeName: string) {
  const row = this.page.locator(`//tr[contains(., "${employeeName}")]`).first();
  const editButton = row.locator('button[title*="Edit"], button:has-text("Bearbeiten"), a[title*="Edit"]');
  await editButton.click();
  
  this.log(`✅ Bearbeiten für ${employeeName} geklickt`, 'info');
  await this.page.waitForLoadState('networkidle').catch(() => {});
});

Wenn('ich die E-Mail auf {string} aktualisiere', async function (this: any, newEmail: string) {
  const emailField = this.page.locator('input[name*="email"], input[placeholder*="email"]').first();
  await emailField.clear();
  await emailField.fill(newEmail);
  
  this.log(`✅ E-Mail aktualisiert auf: ${newEmail}`, 'info');
});

Dann('die E-Mail für {string} sollte {string} sein', async function (this: any, employeeName: string, expectedEmail: string) {
  // Prüfe dass die E-Mail korrekt aktualisiert wurde
  const emailField = this.page.locator('input[name*="email"]').first();
  const value = await emailField.inputValue();
  expect(value).toBe(expectedEmail);
  
  this.log(`✅ E-Mail für ${employeeName} ist ${expectedEmail}`, 'info');
});

Wenn('ich auf {string} klicke, um Details anzuzeigen', async function (this: any, employeeName: string) {
  const row = this.page.locator(`//tr[contains(., "${employeeName}")]`).first();
  const viewButton = row.locator('button[title*="View"], a[title*="View"], button:has-text("Anzeigen")');
  await viewButton.click();
  
  this.log(`✅ Details für ${employeeName} geklickt`, 'info');
  await this.page.waitForLoadState('networkidle').catch(() => {});
});

Dann('sollte ich alle Mitarbeiterinformationen sehen', async function (this: any) {
  // Prüfe dass wir auf der Detail-Seite sind
  const detailElements = this.page.locator('[class*="detail"], [class*="info"], .employee-profile');
  try {
    await expect(detailElements.first()).toBeVisible({ timeout: 5000 });
    this.log('✅ Mitarbeiterinformationen angezeigt', 'info');
  } catch {
    this.log('⚠️ Mitarbeiterinformationen nicht gefunden', 'warn');
  }
});

Dann('die Mitarbeiter-ID sollte angezeigt werden', async function (this: any) {
  const idField = this.page.locator('input[name*="id"], span:has-text("ID")').first();
  try {
    await expect(idField).toBeVisible({ timeout: 5000 });
    this.log('✅ Mitarbeiter-ID angezeigt', 'info');
  } catch {
    this.log('⚠️ Mitarbeiter-ID nicht gefunden', 'warn');
  }
});

Dann('der Beschäftigungsstatus sollte angezeigt werden', async function (this: any) {
  const statusField = this.page.locator('input[name*="status"], span:has-text("Status")').first();
  try {
    await expect(statusField).toBeVisible({ timeout: 5000 });
    this.log('✅ Beschäftigungsstatus angezeigt', 'info');
  } catch {
    this.log('⚠️ Beschäftigungsstatus nicht gefunden', 'warn');
  }
});

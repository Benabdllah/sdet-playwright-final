import { Page } from '@playwright/test';

export class OrangeHRMEmployeePage {
  constructor(private readonly page: Page) {}

  async navigateToEmployeeList() {
    await this.page.click('text=PIM');
    await this.page.click('text=Employee List');
    await this.page.waitForLoadState('networkidle');
  }

  async clickAddEmployee() {
    await this.page.click('button:has-text("Add")');
    await this.page.waitForLoadState('networkidle');
  }

  async fillEmployeeForm(data: {
    firstName: string;
    lastName: string;
    employeeId?: string;
  }) {
    // First Name
    await this.page.fill('input[name="firstName"]', data.firstName);
    
    // Last Name
    await this.page.fill('input[name="lastName"]', data.lastName);
    
    // Employee ID (auto-generated, but can be overridden)
    if (data.employeeId) {
      const employeeIdInput = await this.page.$('input[name="employeeId"]');
      if (employeeIdInput) {
        await employeeIdInput.fill(data.employeeId);
      }
    }
  }

  async saveEmployee() {
    await this.page.click('button:has-text("Save")');
    await this.page.waitForLoadState('networkidle');
  }

  async searchEmployee(employeeName: string) {
    await this.page.fill('input[placeholder*="Search"]', employeeName);
    await this.page.press('input[placeholder*="Search"]', 'Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async getEmployeeCount(): Promise<number> {
    const rows = await this.page.locator('tbody tr').count();
    return rows;
  }

  async getSuccessMessage(): Promise<string> {
    try {
      const message = await this.page.locator('[class*="toast-message"]').first().textContent();
      return message || '';
    } catch {
      return '';
    }
  }

  async deleteEmployee(employeeName: string) {
    // Find employee row and click delete
    const row = this.page.locator(`text=${employeeName}`).first();
    const deleteButton = row.locator('button[title="Delete"]').first();
    await deleteButton.click();

    // Confirm delete
    await this.page.click('button:has-text("Yes, Delete")');
    await this.page.waitForLoadState('networkidle');
  }
}

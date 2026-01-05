import { Page } from '@playwright/test';

export class OrangeHRMLoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('https://opensource-demo.orangehrmlive.com/');
    await this.page.waitForLoadState('networkidle');
  }

  async login(username: string, password: string) {
    // Fill username
    await this.page.fill('input[name="username"]', username);
    
    // Fill password
    await this.page.fill('input[name="password"]', password);
    
    // Click login button
    await this.page.click('button:has-text("Login")');
    
    // Wait for navigation
    await this.page.waitForLoadState('networkidle');
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.waitForSelector('[class*="topbar"]', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async getErrorMessage(): Promise<string> {
    const errorElement = await this.page.$('[class*="alert-danger"]');
    if (errorElement) {
      return await errorElement.textContent() || '';
    }
    return '';
  }

  async logout() {
    // Click user profile icon
    await this.page.click('[class*="userdrop"]');
    
    // Click logout
    await this.page.click('a:has-text("Logout")');
    
    // Wait for login page
    await this.page.waitForURL(/\/auth\/login/);
  }
}

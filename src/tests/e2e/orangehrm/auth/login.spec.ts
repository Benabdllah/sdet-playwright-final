import { test, expect } from '@playwright/test';
import { OrangeHRMLoginPage } from '@pages/OrangeHRMLoginPage';

test.describe('OrangeHRM - Authentication Tests', () => {
  let loginPage: OrangeHRMLoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new OrangeHRMLoginPage(page);
    await loginPage.goto();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Test ID: AUTH-001
    await loginPage.login('Admin', 'admin123');
    
    // Verify logged in
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBeTruthy();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Test ID: AUTH-002
    await loginPage.login('Admin', 'wrongpassword');
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid credentials');
  });

  test('should show error when username is empty', async ({ page }) => {
    // Test ID: AUTH-003
    await loginPage.login('', 'admin123');
    
    // Check for required field error
    const errorText = await page.locator('[class*="error"]').first().textContent();
    expect(errorText).toBeTruthy();
  });

  test('should successfully logout', async ({ page }) => {
    // Test ID: AUTH-004
    await loginPage.login('Admin', 'admin123');
    
    // Verify logged in
    let isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBeTruthy();
    
    // Logout
    await loginPage.logout();
    
    // Verify logged out
    isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBeFalsy();
  });

  test('should persist login session', async ({ page, context }) => {
    // Test ID: AUTH-005
    // Login
    await loginPage.login('Admin', 'admin123');
    
    // Wait a bit for session to be established
    await page.waitForTimeout(2000);
    
    // Navigate to different page
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList');
    
    // Verify still logged in
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBeTruthy();
  });
});

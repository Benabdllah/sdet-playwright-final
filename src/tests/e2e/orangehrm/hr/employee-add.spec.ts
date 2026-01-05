import { test, expect } from '@playwright/test';
import { OrangeHRMLoginPage } from '@pages/OrangeHRMLoginPage';
import { OrangeHRMEmployeePage } from '@pages/OrangeHRMEmployeePage';

test.describe('OrangeHRM - Employee Management Tests', () => {
  let loginPage: OrangeHRMLoginPage;
  let employeePage: OrangeHRMEmployeePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new OrangeHRMLoginPage(page);
    employeePage = new OrangeHRMEmployeePage(page);
    
    // Login before each test
    await loginPage.goto();
    await loginPage.login('Admin', 'admin123');
    
    // Navigate to employee list
    await employeePage.navigateToEmployeeList();
  });

  test('should successfully create new employee', async ({ page }) => {
    // Test ID: HR-001
    const testData = {
      firstName: `TestEmp_${Date.now()}`,
      lastName: 'Automation',
      employeeId: `EMP${Date.now()}`
    };

    // Add employee
    await employeePage.clickAddEmployee();
    await employeePage.fillEmployeeForm(testData);
    await employeePage.saveEmployee();

    // Verify success message
    const successMessage = await employeePage.getSuccessMessage();
    expect(successMessage).toContain('Successfully');

    // Verify employee appears in list
    await employeePage.navigateToEmployeeList();
    await employeePage.searchEmployee(testData.firstName);
    const count = await employeePage.getEmployeeCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should validate required fields when creating employee', async ({ page }) => {
    // Test ID: HR-002
    await employeePage.clickAddEmployee();
    await employeePage.saveEmployee();

    // Check for validation errors
    const errors = await page.locator('[class*="error"]').count();
    expect(errors).toBeGreaterThan(0);
  });

  test('should search employee by name', async ({ page }) => {
    // Test ID: HR-003
    const searchName = 'Peter';
    
    await employeePage.searchEmployee(searchName);
    
    const count = await employeePage.getEmployeeCount();
    expect(count).toBeGreaterThan(0);

    // Verify search results contain the search term
    const firstRowText = await page.locator('tbody tr').first().textContent();
    expect(firstRowText).toContain(searchName);
  });

  test('should delete employee', async ({ page }) => {
    // Test ID: HR-004
    const testData = {
      firstName: `DeleteTest_${Date.now()}`,
      lastName: 'Automation'
    };

    // Create employee first
    await employeePage.clickAddEmployee();
    await employeePage.fillEmployeeForm(testData);
    await employeePage.saveEmployee();

    // Navigate back to list
    await employeePage.navigateToEmployeeList();
    
    // Delete employee
    await employeePage.deleteEmployee(testData.firstName);

    // Verify success
    const successMessage = await employeePage.getSuccessMessage();
    expect(successMessage).toContain('Successfully Deleted');
  });

  test('should display employee count', async ({ page }) => {
    // Test ID: HR-005
    const count = await employeePage.getEmployeeCount();
    
    expect(count).toBeGreaterThan(0);
    console.log(`Total employees: ${count}`);
  });
});

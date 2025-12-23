import { test } from '@playwright/test';
import { PageManager } from '../pages/pageManager';

test('Navigation Test', async ({ page }) => {
  const pageManager = new PageManager(page);

  await page.goto('https://testautomationpractice.blogspot.com/');
  await pageManager.getNavigationPage().navigateToHome();
});

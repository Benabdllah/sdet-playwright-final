import { test } from '@playwright/test';
import { PageManager } from '../pages/pageManager';
import { selectDropdownOption } from '../utils/dropdown-utils';
import { uploadFile } from '../utils/file-upload-utils';
import { switchToFrame } from '../utils/frame-utils';
import { handleAlert } from '../utils/alert-utils';

test('Navigation Test', async ({ page }) => {
  const pageManager = new PageManager(page);

  await page.goto('https://testautomationpractice.blogspot.com/');
  await pageManager.getNavigationPage().navigateToHome();
});

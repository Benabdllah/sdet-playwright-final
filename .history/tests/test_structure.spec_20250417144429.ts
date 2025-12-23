import { test } from '@playwright/test';
import { PageManager } from '../pages/pageManager';
import { selectDropdownOption } from '../utils/dropdown-utils';
import { uploadFile } from '../utils/file-upload-utils';
import { switchToFrame } from '../utils/frame-utils';
import { handleAlert } from '../utils/alert-utils';

test.beforeEach(async({page}))=
test('Navigation Test', async ({ page }) => {
  const pageManager = new PageManager(page);

  await page.goto('https://testautomationpractice.blogspot.com/');
  await pageManager.getNavigationPage().navigateToHomePage();
});

test('Komplett-Test mit Utilities', async ({ page }) => {
    await page.goto('https://testautomationpractice.blogspot.com/');
  
    await selectDropdownOption(page, '#country', 'India');
    await uploadFile(page, '#uploadfile', 'tests/resources/samplefile.txt');
    
    const frame = await switchToFrame(page, 'frame-name');
    await frame.locator('button').click();
  
    await handleAlert(page, 'accept');
  });
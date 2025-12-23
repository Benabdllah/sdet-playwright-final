import { test } from '@playwright/test';
import { PageManager } from '../pages/pageManager';
import { selectDropdownOption } from '../utils/dropdown-utils';
import { uploadFile } from '../utils/file-upload-utils';
import { switchToFrame } from '../utils/frame-utils';
import { handleAlert } from '../utils/alert-utils';

test.beforeEach(async({page})=>{
    await page.goto('https://www.pavanonlinetrainings.com/p/udemy-courses.html')
})

test('Navigation Test', async ({ page }) => {
  const pageManager = new PageManager(page);

 
  await pageManager.getNavigationPage().navigateToHomePage();
});

test('Komplett-Test mit Utilities', async ({ page }) => {
   
  
    //await selectDropdownOption(page, '#country', 'India');
   // await uploadFile(page, '#singleFileInput', 'tests/resources/samplefile.txt');
    
    const frame = await switchToFrame(page, 'I0_1744899626408');
    await frame.locator('button').click();
  
    //await handleAlert(page, 'accept');
  });
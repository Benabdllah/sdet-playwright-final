import { test } from '@playwright/test';
import { PageManager } from '../pages/pageManager';
import { selectDropdownOption } from '../utils/dropdown-utils';
import { uploadFile } from '../utils/file-upload-utils';
import { switchToFrame } from '../utils/frame-utils';
import { handleAlert } from '../utils/alert-utils';
import { closeModalIfVisible } from '../helpers/modal-utils';

import { waitForLazyElement } from '../helpers/lazy-loading-utils';
import { waitForFileDownload } from '../helpers/file-download-utils';
import { downloadAndCheckPDFContent } from '../helpers/pdf-download-utils';

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
    
   const frame = await switchToFrame(page, /pavanonlinetrainings/); // URL oder Name
   await frame.getByRole('button', { name: 'YouTube' }).click({ force: true });
  
    //await handleAlert(page, 'accept');
  });



  test('Beispiel Test helpers', async ({ page }) => {
    await page.goto('https://deine-seite.de');
  
    await closeModalIfVisible(page, '.modal-dialog');
    await handleAlert(page, 'accept');
    await waitForLazyElement(page, 'img.lazyload');
    await waitForFileDownload(page, '#downloadButton', 'downloads');
    await downloadAndCheckPDFContent(page, '#pdfDownload', 'Herzlich Willkommen');
  });
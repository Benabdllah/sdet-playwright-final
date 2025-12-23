import { test } from '@playwright/test';
import { PageManager } from '../pages/pageManager';
import { selectDropdownOption } from '../utils/dropdown-utils';
import { uploadFile } from '../utils/file-upload-utils';
import { switchToFrame } from '../utils/frame-utils';
import { handleAlert } from '../utils/alert-utils';
import { closeModalIfVisible } from '../utils/modal-utils';

import { waitForLazyElement } from '../utils/lazy-loading-utils';
import { waitForFileDownload } from '../utils/file-download-utils';
import { downloadAndCheckPDFContent } from '../utils/pdf-download-utils';

test.beforeEach(async({page})=>{
    await page.goto('https://ui.vision/demo/webtest/frames/')
})

test('Navigation Test', async ({ page }) => {
  const pageManager = new PageManager(page);

 
  await pageManager.getNavigationPage().navigateToHomePage();
});

test('Komplett-Test mit Utilities', async ({ page }) => {
   
  
    //await selectDropdownOption(page, '#country', 'India');
   // await uploadFile(page, '#singleFileInput', 'tests/resources/samplefile.txt')
   const frame = await switchToFrame(page, 'frame_3'); // URL oder Name
   await frame.getByRole('mytext').fill
   page.waitForTimeout(5000)
    //await handleAlert(page, 'accept');
  });



 /* test('Beispiel Test helpers', async ({ page }) => {
    await page.goto('https://deine-seite.de');
  
    await closeModalIfVisible(page, '.modal-dialog');
    await handleAlert(page, 'accept');
    await waitForLazyElement(page, 'img.lazyload');
    await waitForFileDownload(page, '#downloadButton', 'downloads');
    await downloadAndCheckPDFContent(page, '#pdfDownload', 'Herzlich Willkommen');
  });*/
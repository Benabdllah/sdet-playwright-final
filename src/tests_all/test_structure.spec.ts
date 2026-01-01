import { test } from '@playwright/test';
import { PageManager } from '../pages/pages_POM/pageManager';


import { handlePrompt,handleAlert } from '../utils/alert-utils';




test.beforeEach(async({page})=>{
    await page.goto('https://the-internet.herokuapp.com/javascript_alerts')
    await page.waitForTimeout(5000)
})

test.skip('Navigation Test', async ({ page }) => {
  const pageManager = new PageManager(page);

 
  await pageManager.getNavigationPage().navigateToHomePage();
});

test.skip('Komplett-Test mit Utilities', async ({ page }) => {
   
  
    //await selectDropdownOption(page, '#country', 'India');
   // await uploadFile(page, '#singleFileInput', 'tests/resources/samplefile.txt')
   //const frame = await switchToFrame(page, 'frame_3'); // URL oder Name
  // await frame.locator('input[name="mytext3"]').fill('benAbdllah')
  // await page.screenshot({path:'screenshots/frame.png'})
   await page.locator("button[onclick='jsAlert()']").click()
  
    await handleAlert(page, 'accept');
    
   
    
  });



 /* test('Beispiel Test helpers', async ({ page }) => {
    await page.goto('https://deine-seite.de');
  
    await closeModalIfVisible(page, '.modal-dialog');
    await handleAlert(page, 'accept');
    await waitForLazyElement(page, 'img.lazyload');
    await waitForFileDownload(page, '#downloadButton', 'downloads');
    await downloadAndCheckPDFContent(page, '#pdfDownload', 'Herzlich Willkommen');
  });*/
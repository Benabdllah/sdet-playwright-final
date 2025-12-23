import { test } from '@playwright/test';
import { switchToFrame } from '../../utils/frame-utils';
import { safeClick } from '../../utils/frame-click-utils';
import { listAllFrames } from '../../utils/frame-inspector';
import { takescreen } from '../../utils/screenshot-util';
import { checkOrClickCheckbox } from '../../utils/checkbox-utils';
import { handleAlert } from '../../utils/alert-utils';

test('Sicherer Click innerhalb Frame', async ({ page }) => {
  await page.goto('https://www.pavanonlinetrainings.com/p/udemy-courses.html');

  
  const frame = await switchToFrame(page,/pavanoltraining/); // Teil-URL des Frames 

  await safeClick(frame,'button span.subscribe-label[aria-label="YouTube"]');
  await page.waitForTimeout(8000)
});

test('Liste aller Frames anzeigen', async ({ page }) => {
    //await page.goto('https://ui.vision/demo/webtest/frames/');
    await page.goto('https://www.pavanonlinetrainings.com/p/udemy-courses.html');
    await listAllFrames(page); // 👉 zeigt alle vorhandenen Frames
    await page.waitForTimeout(2000)
  
    
  })
test('Frame anzeigen und befüllen', async ({ page }) => {

    await page.goto('https://ui.vision/demo/webtest/frames/');
    const frame3= await page.frame({url:'https://ui.vision/demo/webtest/frames/frame_3.html'})
    frame3.locator("input[name='mytext3']").fill('welcome')
    
    await page.waitForTimeout(2000)
    
  })
test('Checkbox in nested Frame klicken version 1', async ({ page }) => {

    await page.goto('https://ui.vision/demo/webtest/frames/');
    const frame3= await switchToFrame(page,'frame_3')
    const childFrame=frame3?.childFrames()[0]
    //const loc=childFrame.locator("//div[@id='i6']//div[contains(@class, 'AB7Lab')]").click({force:true})
    await safeClick(childFrame,"//div[@id='i6']//div[contains(@class, 'AB7Lab')]");
    await takescreen(page,'iframe')
    
    await page.waitForTimeout(5000)
    
  })

  test('Checkbox in nested Frame klicken version2', async ({ page }) => {
    await page.goto('https://ui.vision/demo/webtest/frames/');
  
    const frame3 = await page.frame({ url: /frame_3\.html/ });
    const childFrame = frame3?.frameLocator('iframe');
  
    if (childFrame) {
      await checkOrClickCheckbox(
        childFrame,
        "//div[@id='i6']//div[contains(@class, 'AB7Lab')]" // Google/Material UI-artige Checkbox
      );
    }
    //await takescreen(page,'frame_version2')
    await page.waitForTimeout(2000);
    
  });








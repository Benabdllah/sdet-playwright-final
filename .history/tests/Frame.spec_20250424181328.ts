import { test } from '@playwright/test';
import { switchToFrame } from '../utils/frame-utils';
import { safeClick } from '../utils/frame-click-utils';
import { listAllFrames } from '../utils/frame-inspector';
import { takescreen } from '../utils/screenshot-util';
import { checkOrClickCheckbox } from '../utils/checkbox-utils';

test.skip('Sicherer Click innerhalb Frame', async ({ page }) => {
  await page.goto('https://www.pavanonlinetrainings.com/p/udemy-courses.html');

  const frame = await switchToFrame(page, /pavanonlinetrainings/);
  await safeClick(frame, 'button:has-text("YouTube")');
});

test('Liste aller Frames anzeigen', async ({ page }) => {
    await page.goto('https://ui.vision/demo/webtest/frames/');
  
   // await listAllFrames(page); // 👉 zeigt alle vorhandenen Frames
    
    const frame3= await page.frame({url:'https://ui.vision/demo/webtest/frames/frame_3.html'})

    //frame3.locator("input[name='mytext3']").fill('welcome')
    
    
    await page.waitForTimeout(2000)
    
  })
  test('Nested Frame', async ({ page }) => {
    await page.goto('https://ui.vision/demo/webtest/frames/');
  
   // await listAllFrames(page); // 👉 zeigt alle vorhandenen Frames
    //const frame3= await switchToFrame(page,'frame_3')
    const frame3= await page.frame({url:'https://ui.vision/demo/webtest/frames/frame_3.html'})

    //frame3.locator("input[name='mytext3']").fill('welcome')
    
    const childFrame=frame3?.childFrames()[0]
    // const html = await childFrames.locator("//div[@id='i6']").innerHTML();
    // console.log(html);
    // 'if (childFrame) {
    //   await checkOrClickCheckbox(
    //     childFrame,
    //     "//div[@id='i6']//div[contains(@class, 'AB7Lab')]" // Google/Material UI-artige Checkbox
    //   );
    // }'
    await childFrame.locator("//div[@id='i6']//div[contains(@class, 'AB7Lab')]").click({force:true})
   
    //await takescreen(page,'nestedframe1')
    await page.waitForTimeout(2000)
    
  })
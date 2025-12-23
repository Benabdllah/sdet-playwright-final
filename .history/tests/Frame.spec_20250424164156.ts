import { test } from '@playwright/test';
import { switchToFrame } from '../utils/frame-utils';
import { safeClick } from '../utils/frame-click-utils';
import { listAllFrames } from '../utils/frame-inspector';
import { takescreen } from '../utils/screenshot-util';

test.skip('Sicherer Click innerhalb Frame', async ({ page }) => {
  await page.goto('https://www.pavanonlinetrainings.com/p/udemy-courses.html');

  const frame = await switchToFrame(page, /pavanonlinetrainings/);
  await safeClick(frame, 'button:has-text("YouTube")');
});

test('Liste aller Frames anzeigen', async ({ page }) => {
    await page.goto('https://ui.vision/demo/webtest/frames/');
  
    //await listAllFrames(page); // 👉 zeigt alle vorhandenen Frames
    const frame3= await switchToFrame(page,'frame_3')
    //frame3.locator("input[name='mytext3']").fill('welcome')
    
    const childFrames=await frame3.childFrames()
    await childFrames[0].locator("div[class='AB7Lab Id5V1']").check()
   
    takescreen(page,'nestedframe')
    await page.waitForTimeout(5000)
  })
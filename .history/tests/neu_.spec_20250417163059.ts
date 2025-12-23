import { Page, Frame } from '@playwright/test';


await page.goto('https://www.pavanonlinetrainings.com/p/udemy-courses.html')

const frame = page.frame({ name: frameNameOrId }) || page.frame({ url: new RegExp(frameNameOrId) });
  if (!frame) {
    throw new Error(`❌ Frame mit Name oder URL "${frameNameOrId}" nicht gefunden!`);
  }
  return frame;


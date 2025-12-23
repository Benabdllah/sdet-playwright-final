import { test } from '@playwright/test';
import { checkOrClickCheckbox } from '../utils/checkbox-utils';


test('Checkbox in Frame klicken', async ({ page }) => {
  await page.goto('https://ui.vision/demo/webtest/frames/');

  const frame3 = await page.frame({ url: /frame_3\.html/ });
  const childFrame = frame3?.childFrames();

  if (childFrame) {
    await checkOrClickCheckbox(
      childFrame,
      "//div[@id='i6']//div[contains(@class, 'AB7Lab')]" // Google/Material UI-artige Checkbox
    );
  }

  await page.waitForTimeout(2000);
});

import { test } from '@playwright/test';
import { switchToFrame } from '../utils/frame-utils';
import { safeClick } from '../utils/frame-click-utils';

test('Sicherer Click innerhalb Frame', async ({ page }) => {
  await page.goto('https://www.pavanonlinetrainings.com/p/udemy-courses.html');

  const frame = await switchToFrame(page, /pavanonlinetrainings/);
  await safeClick(frame, 'button:has-text("YouTube")');
});

import { test, expect } from '@playwright/test';
import { takescreen } from '../../utils/screenshot-util';  
import { switchToFrame } from '../../utils/frame-utils';
import { safeClick } from '../../utils/frame-click-utils';
/*
الكود هذا يستخدم الـ Ternary Operator (الشرط الثلاثي)
👉 "هل المتغير pavanonlinetrainings من نوع string؟"
يعني هل هو نص، مثلاً "myFrame" أو "https://example.com/frame" ؟

إذا نعم (true) → ينفذ الجزء الأول بعد علامة ?

إذا لا (false) → ينفذ الجزء الثاني بعد علامة :
أولاً يحاول يبحث عن iframe بالاسم:
إذا ما لقى، يستخدم الـ OR (||)
ويحاول يبحث عن iframe بالرابط (URL) الل يحتوي النص:
يعني يحوّل النص إلى RegExp (تعبير منتظم)
حتى يقدر يبحث عن iframe عنوانه يحتوي مثلاً "pavanonlinetrainings".
في هذه الحالة، المتغير pavanonlinetrainings مش نص،
فالكود يستخدم نمط ثابت (Regular Expression) للبحث عن iframe يحتوي في الـ URL على كلمة "pavanonlinetrainings".
*/

test('Navigation Test', async ({ page }) => {
await page.goto('https://www.pavanonlinetrainings.com/p/udemy-courses.html');
const frameName = 'pavanoltraining';
await page.waitForLoadState('networkidle');
// Debug: Welche Frames gibt es?
  for (const f of page.frames()) {
    console.log('Frame:', f.name(), f.url());
  }
const frame = typeof frameName === 'string'
  ? page.frame({ name: frameName })
  || page.frame({ url: new RegExp(frameName) })
  : page.frame({ url: /pavanoltraining/ });

  if (frame) console.log('Using frame:', frame.name(), frame.url()) 
     else {
     
    throw new Error('Frame not found!')
    };


  //const button = frame.getByRole('button').locator('span.subscribe-label[aria-label="YouTube"]');
  // await expect(button).toBeVisible();
  // await button.click();

 //await frame.locator('span[aria-label="YouTube"]:visible').click();
  //const youtubeButton = frame.locator('button.yt-uix-subscription-button:visible');
  //await youtubeButton.click();

  //const button = frame.locator('button[data-href*="youtube.com/channel"] span[aria-label="YouTube"]:visible');

  //await expect(button).toBeVisible();
  //await button.click();

  //await frame.locator('button[data-href*="youtube.com/channel"]').first().click();

  //const button= frame.locator('button:has(span:has-text("YouTube"))').click({force:true});
  const button = frame.locator('span[aria-label="YouTube"]:visible');
 

  //await expect(button).toBeVisible();
  //await button.click();
// console.log('All frames on page:');
// page.frames().forEach((f,i) => console.log(i+1.,f.name(), f.url()));
await page.waitForTimeout(10000);
 await takescreen(page,'frame_navigation_test_2');


});

test('Navigation Test 2', async ({ page }) => {
  await page.goto('https://www.pavanonlinetrainings.com/p/udemy-courses.html');

  // انتظر تحميل جميع الإطارات (frames)
  await page.waitForLoadState('domcontentloaded');

  // ابحث عن الـ iframe الذي يحتوي على الكلمة "pavanonlinetrainings"
  const frame = page
    .frames()
    .find(f => f.url().includes('pavanonlinetrainings'));

  // تأكد أن الإطار تم إيجاده
  expect(frame, 'لم يتم العثور على الإطار المطلوب').not.toBeNull();

  // اضغط على زر YouTube داخل الإطار
  //await frame.getByRole('button', { name: 'YouTube' }).click({ force: true });
  const button = frame.locator('button[data-href*="youtube.com/channel"]:visible');

  await expect(button).toBeVisible();
  await button.click();

});

test('Navigation Test - Alternative Methode', async ({ page }) => {
  await page.goto('https://www.pavanonlinetrainings.com/p/udemy-courses.html'); 
const frame = 
  page.frame({ name: 'pavanonlinetrainings' }) 
  || page.frame({ url: /pavanonlinetrainings/ });

await frame.getByRole('button', { name: 'YouTube' }).click({ force: true });
})

test('YouTube Subscribe Button - robust click', async ({ page }) => {
  await page.goto('https://www.pavanonlinetrainings.com/p/udemy-courses.html');
  await page.waitForLoadState('networkidle');

  // Frame oder page
  const frame = page.frame({ url: /pavanoltraining/ }) || page;
  const selector = 'button[data-href*="youtube.com/channel"]';

  // Warte auf Existenz
  //await frame.waitForSelector(selector, { state: 'attached', timeout: 5000 });

  // Wähle das sichtbare Element (falls mehrere)
  const button = frame.locator(selector + ':visible').first();

  // Bestätigungen für Debugging (optional)
  await expect(button).toBeVisible({ timeout: 5000 });
  console.log('Button is visible, attempting click...');

  // 1) Versuche normal zu klicken
  try {
    await button.click({ timeout: 3000 });
    console.log('Clicked with locator.click()');
    return;
  } catch (err) {
    console.log('click() failed, trying fallbacks:', err.message || err);
  }

  // 2) Scroll into view + click
  try {
    await button.scrollIntoViewIfNeeded();
    await button.click({ timeout: 3000 });
    console.log('Clicked after scrollIntoViewIfNeeded');
    return;
  } catch (err) {
    console.log('scroll+click failed:', err.message || err);
  }

  // 3) Force click (ignoriert Overlays)
  try {
    await button.click({ force: true });
    console.log('Clicked with force:true');
    return;
  } catch (err) {
    console.log('force click failed:', err.message || err);
  }

  // 4) Eval: Auslösen via DOM .click(), frame.evaluate() → ينفذ كود JavaScript داخل الصفحة مباشرة.

//document.querySelector(sel).click() → ينقر على الزر مباشرة عبر DOM.
  try {
    await frame.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) throw new Error('element not found for evaluate click');
      el.click();
    }, selector);
    console.log('Clicked via element.click() in evaluate');
    return;
  } catch (err) {
    console.log('evaluate click failed:', err.message || err);
  }
await frame.evaluate((sel) => { document.querySelector(sel).click(); }, selector);
  // 5) Simuliere Maus-Klick an der Mitte (useful when overlay or weird CSS)
  try {
    const box = await button.boundingBox();
    if (!box) throw new Error('boundingBox null - element not visible');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.up();
    console.log('Clicked via page.mouse at boundingBox center');
    return;
  } catch (err) {
    console.log('mouse click failed:', err.message || err);
  }

  // 6) Wenn alles fehlschlägt:
  throw new Error('All click strategies failed for ' + selector);
});
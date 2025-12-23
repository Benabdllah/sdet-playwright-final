import { expect, Locator, Page,test,chromium } from '@playwright/test'

test('Handle Pages/Windows', async()=>{
    const browser= await chromium.launch()
    const context= await browser.newContext()
    const page1= await context.newPage()
    const page2= await context.newPage()

    const allPages=context.pages()
    console.log('Number of Pages created:',allPages.length)

    await page1.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login')
    await expect(page1).toHaveTitle('OrangeHRM')

    await page2.goto('https://www.orangehrm.com/')
    await expect(page2).toHaveTitle('Human Resources Management Software | HRMS | OrangeHRM')
})

test('Handle Multiple Pages/Windows', async()=>{
    
    const browser= await chromium.launch()
    const context= await browser.newContext()
    const page1= await context.newPage()

    await page1.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login')
    await expect(page1).toHaveTitle('OrangeHRM')
    const pagePromise=context.waitForEvent('page')
    await page1.locator('//a[normalize-space()="OrangeHRM, Inc"]').click()
    
   const newPage=await pagePromise
    await expect(newPage).toHaveTitle('Human Resources Management Software | HRMS | OrangeHRM')
    await browser.close()
})

test('compare two accounts simultaneously', async ({ browser }) => {
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();

  const [page1, page2] = await Promise.all([
    context1.newPage(),
    context2.newPage(),
  ]);

  await Promise.all([
    page1.goto('/account/123'),
    page2.goto('/account/456'),
  ]);
});

//14. Playwright + Docker + Xvfb + CI Cache Magic
# playwright.config.ts
use: {
  viewport: null,
  headless: process.env.CI ? true : false,
  launchOptions: {
    args: ['--disable-gpu', '--no-sandbox', '--single-process']
  }
}
→ Läuft in 1.5 GB RAM Containern stabil
→ Mit Cache (playwright install --with-deps) in unter 20s gestartet
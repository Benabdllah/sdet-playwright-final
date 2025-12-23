import { test, expect, chromium, Browser, Page, BrowserContext } from '@playwright/test'

let browser: Browser
let context: BrowserContext
let page: Page

test.beforeAll(async () => {
  
  browser = await chromium.launch({
    
    
  })
  context = await browser.newContext()
  page = await context.newPage()
  await page.goto('http://localhost:4200/')
})
// Dialog Box
test.describe('Form layouts page',()=>{
  test.beforeEach(async ({page}) => {
    await page.getByText('Forms').click()
    await page.getByText('Form Layouts').click()
  })

}

)


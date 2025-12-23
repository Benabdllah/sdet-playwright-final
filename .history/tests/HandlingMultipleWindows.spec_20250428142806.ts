import { expect, Locator, Page,test,chromium } from '@playwright/test'

test('Handle Pages/Windows', async()=>{
    const browser= await chromium.launch()
    const context= await browser.newContext()
    const page1= await context.newPage()
    const page2= await context.newPage()

    const allPages=context.pages()
    console.log('Number of Pages created:',allPages.length)

    // await page1.goto()
})
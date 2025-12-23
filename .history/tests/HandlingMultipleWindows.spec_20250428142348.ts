import { expect, Locator, Page,test,chromium } from '@playwright/test'

test('Handle Pages/Windows', async()=>{
    const browser= await chromium.launch()
    const context= await browser.newContext()
    const page1= 
})
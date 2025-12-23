import {test, expect} from 'playwright/test'

test('locators',async({page}) => {
    await page.goto('https://demoblaze.com/')

// click login button -property
// await page.locator('id=login2').click()
await page.click('id=login2')

// provide username -CSS
//await page.locator('#loginusername').fill('pavanol')
//await page.fill('#loginusername','pavanol')
await page.type('#loginusername','pavanol')

// provide password
await page.fill('//input[@id="loginpassword"]','test@123')

// click on login button 
await.page.click('//button[normalize-space()="Log in"]')





























})

import {test, expect} from 'playwright/test'

test.only('locators',async({page}) => {
await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login')

// click login button -property
// await page.locator('id=login2').click()
await page.click('id=login2')

// provide username -CSS
//await page.locator('#loginusername').fill('pavanol')
await page.fill('#loginusername','pavanol')
//await page.type('#loginusername','pavanol')
page.waitForTimeout(6000)

// provide password - Xpath 
await page.fill('//input[@id="loginpassword"]','test@123')
page.waitForTimeout(6000)
// click on login button - Xpath 
await page.click('//button[normalize-space()="Log in"]')
page.waitForTimeout(6000)

// verify logout link presence
const logoutlink= page.locator("(//a[normalize-space()='Log out'])[1]")

await expect(logoutlink).toBeVisible()
await page.close()


})

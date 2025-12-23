import {test, expect} from 'playwright/test'

test.only('locators',async({page}) => {
await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login')

//usually image, by its text alternative
const logo= page.getByAltText("company-branding")



})

import {test, expect} from 'playwright/test'

test('locators',async({page}) => {
    await page.goto('https://demoblaze.com/')
})
// click login button -property
// await page.locator('id=login2').click()
await pageXOffset.click('id=login2')
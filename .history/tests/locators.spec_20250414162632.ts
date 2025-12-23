import {test, expect} from 'playwright/test'

test('locators',async({page}) => {
    await page.goto('https://demoblaze.com/')
})
// click login
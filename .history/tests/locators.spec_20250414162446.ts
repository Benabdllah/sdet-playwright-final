import {test, expect} from 'playwright/test'
test.beforeEach('locators'async({page}) => {
    await page.goto('/')
})
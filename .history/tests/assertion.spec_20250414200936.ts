import {test, expect} from 'playwright/test'

test('assertionTes',async({page}) => {
await page.goto('https://demo.nopcommerce.com/register')

//1) 
await expect(page).toHaveURL('https://demo.nopcommerce.com/register')

//2
await expect(page).toHaveTitle('nopCommerce demo store. Register')

//3) expect(locator).toBevisible()

const logoElem= page.locator('.header-logo')
await expect(logoElem).toBeVisible()

//4) expect(locator).toBeeneabled()

})

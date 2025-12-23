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

//4) expect(locator).toBeEnabled()

const  searchStoreBox= page.locator('#small-searchterms')
await expect(searchStoreBox).toBeEnabled()

//5) expect(locator).toBeChecked()  radio/checkBpx is checked
//radio button

const maleRadioButton= page.locator('#gender-male')
await maleRadioButton.click()
await expect(maleRadioButton).toBeChecked()

//check Box
const newsletterCheckbox= page.locator('#Newsletter')
await expect


})

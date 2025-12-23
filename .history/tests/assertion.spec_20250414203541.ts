import { E } from '@faker-js/faker/dist/airline-CBNP41sR'
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
await expect(newsletterCheckbox).toBeChecked()

//6  expect(locator).toHaveAttribute() Element has attribute

const regButton= page.locator('#register-button')
await expect(regButton).toHaveAttribute('type','submit')

//7 expect(locator).toHaveText() Element maches text
await expect(page.locator('.page-title h1')).toHaveText('Register')

//8 expect(locator).toContainText() Element contains text
await expect(page.locator('.page-title h1')).toContainText('Reg')

//9 expect(locator).toHaveValue() Input has a Value

const emailInput= page.locator('#Email')
await emailInput.fill('ben@gmail.com')
await expect(emailInput).toHaveValue('ben@gmail.com')

//10 expect(locator).toHaveCount() List of elements has giveb lenght

const options = page.locator('select[name="DateOfBirthMonth"] option'

 )


})

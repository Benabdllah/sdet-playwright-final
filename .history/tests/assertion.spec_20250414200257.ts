import {test, expect} from 'playwright/test'

test('assertionTes',async({page}) => {
await page.goto('https://demo.nopcommerce.com/register')

//1) 
expect(page).toHaveURL('https://demo.nopcommerce.com/register')

//2
ex

})

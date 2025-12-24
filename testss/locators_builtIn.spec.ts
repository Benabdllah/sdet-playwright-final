import {test, expect} from 'playwright/test'

test('locators',async({page}) => {
await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login')

//usually image, by its text alternative

const logo= page.getByAltText("company-branding")
await expect(logo).toBeVisible()

// placeholder

await page.getByPlaceholder('Username').fill('Admin')
await page.getByPlaceholder('Password').fill('admin123')

//await page.getByRole('button', {type: 'submit'}).click()

await page.getByRole('button', {name: 'login'}).click()

const name= await page.locator('//li[@class="oxd-userdropdown"]')
.locator('//p[@class="oxd-userdropdown-name"]').textContent()
await expect(page.getByText(name)).toBeVisible()

await page.close()

})

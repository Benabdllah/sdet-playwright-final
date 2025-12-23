import { test, expect, chromium, Browser, Page, BrowserContext } from '@playwright/test'

let browser: Browser
let context: BrowserContext
let page: Page

test.beforeAll(async () => {
  
  browser = await chromium.launch({
    
    
  })
  context = await browser.newContext()
  page = await context.newPage()
  await page.goto('http://localhost:4200/')
})
// Dialog Box
test.describe('Form layouts page',()=>{
  test.beforeEach(asy
}

)
test('dialog box', async () => {
  await page.getByText('Tables & Data').click()
  await page.getByText('Smart Table').click()

  page.on('dialog', dialog => {
    expect(dialog.message()).toEqual('Are you sure you want to delete?')
    dialog.accept()
  })

  await page.getByRole('table').locator('tr',{hasText: "mdo@gmail.com"}).locator('.nb-trash').click()
  await expect(page.locator('table tr').first()).not.toHaveText("mdo@gmail.com")
})
test('web table', async() => {
  await page.getByText('Tables & Data').click()
  await page.getByText('Smart Table').click()

  // 1 get the row by any test in this row
  const targetRow = page.getByRole('row',{name:"twitter@outlook.com"})
  await targetRow.locator('.nb-edit').click()
  await page.locator('input-editor').getByPlaceholder('Age').clear()
  await page.locator('input-editor').getByPlaceholder('Age').fill('35')
  await page.locator('.nb-checkmark').click()

})
// test.afterAll(async () => {
//   await browser.close()
// })

import { test, expect,Page } from '@playwright/test';
import { takescreen } from '../utils/screenshot-util';


test.only('handling table', async ({page }) => {
 
await page.goto('https://testautomationpractice.blogspot.com/')

// await page.fill('#datepicker','03/15/2024')

//datepicker
const year="2024"
const month="march"
const date="20"

await page.click('#datepicker')


await takescreen(page,'datepicker')

while (true)
    {
    const currentYear= await page.locator('.ui-datepicker-year').textContent()
    const currentMonth= await page.locator('.ui-datepicker-month').textContent()

    if(currentYear == year && currentMonth == month)
        {
                break
        }
        await page.locator('[title="Next"]').click() //next
    }   
await page.$$('//a')

})
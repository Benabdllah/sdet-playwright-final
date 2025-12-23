import { test, expect,Page } from '@playwright/test';
import { takescreen } from '../utils/screenshot-util';


test.only('handling DatePicker', async ({page }) => {
 
await page.goto('https://testautomationpractice.blogspot.com/')

// await page.fill('#datepicker','03/15/2024')

//datepicker
const year="2050"
const month="August"
const date="20"

await page.click('#datepicker')




while (true)
    {
    const currentYear= await page.locator('.ui-datepicker-year').textContent()
    const currentMonth= await page.locator('.ui-datepicker-month').textContent()

    if(currentYear == year && currentMonth == month)
        {
                break
        }
        await page.locator("[title='Next']").click() //next
    }   
// date select -wit loop
    const dates= await page.$$("//a[@class='ui-state-default']")

for (const dt of dates)
    {
            if(await dt.textContent() == date)
            {
                await dt.click({force:true})
                break
            }
    }
await takescreen(page,'datepicker')


// date select -without loop
await page.click(`//a[@class='ui-state-default'][text()='${date}']`)

})
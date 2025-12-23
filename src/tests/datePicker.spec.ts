import { test } from '@playwright/test';
import { takescreen } from '../../utils/screenshot-util';


test('handling DatePicker', async ({page }) => {
 
await page.goto('https://testautomationpractice.blogspot.com/')

// await page.fill('#datepicker','03/15/2024')

//datepicker
const year="2026"
const month="February"
const date="15"

await page.click('#datepicker')

// year and month select - with loop

while (true)
    {
    const currentYear= await page.locator('.ui-datepicker-year').textContent()// = 2025
    const currentMonth= await page.locator('.ui-datepicker-month').textContent()//=November

    if(currentYear == year && currentMonth === month)
        {
                break
        }
        await page.locator("[title='Next']").click() //next
    }   
// date select -with loop

const dates= await page.locator("//a[@class='ui-state-default']").all()// all date elements in datepicker

for (const dt of dates)
    {
            if(await dt.textContent() == date)//15
            {
                await dt.click({force:true})
                break
            }
    }

// date select -without loop

//await page.click(`//a[@class='ui-state-default'][text()='${date}']`)

await takescreen(page,'datepicker')
//await page.waitForTimeout(20000)
})
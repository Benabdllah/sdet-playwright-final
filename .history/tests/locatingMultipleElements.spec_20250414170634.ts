import {test, expect} from 'playwright/test'

test.only('locateMupltipleElements',async({page}) => {
await page.goto('https://demoblaze.com/index.html')

const links = await page.$$('a')

for(const link of links)
{
        const lintext= link.textContent()	
        console.log(lin)
}

})

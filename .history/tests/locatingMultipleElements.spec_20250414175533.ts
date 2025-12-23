import {test, expect} from 'playwright/test'

test('locateMupltipleElements',async({page}) => {
await page.goto('https://demoblaze.com/index.html')
page.waitForLoadState
/*const links = await page.$$('a')

for(const link of links)
{
        const linktext= await link.textContent()	
        console.log(linktext);
}*/

// locate all products displayed on home page

    const products= await page.$$("body > div:nth-child(6) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(9) > div:nth-child(1) > div:nth-child(2) > h4:nth-child(1) > a:nth-child()")
    for(const product of products)
    {
        
        const prodname= await product.textContent()
        console.log('die produkte sind: ' + prodname)
        
    }

 
})

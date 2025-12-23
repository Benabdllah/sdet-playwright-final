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

    const products= await page.$$("//div[@id='tbodyid']//h4/a")
    for(const product of products)
        {
        const prodname= await product.textContent();
        
        
        console.log(produktname);
        
    }
 
})

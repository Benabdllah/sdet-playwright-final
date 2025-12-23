import {test, expect} from 'playwright/test'

test('locateMupltipleElements',async({page}) => {
await page.goto('https://demoblaze.com/index.html')

/*const links = await page.$$('a')

for(const link of links)
{
        const linktext= await link.textContent()	
        console.log(linktext);
}*/

// locate all products displayed on home page
page.wait
 const products= await page.$$(".hrefch")
 for(const product of products)
    {
    const produktname= await product.textContent()
    console.log(produktname)
 }
})

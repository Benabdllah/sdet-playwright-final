import { expect, Locator, Page,test } from '@playwright/test';
import { takescreen } from '../utils/screenshot-util';
import { PageManager } from '../page-objects-sdet/PageManager';

test('test', async ({page})=>{
    const pm= new PageManager(page)
    //Login

    //const loginpage= new LoginPage(page)
    await pm.CartPage.navigateTo('https://www.demoblaze.com/index.html')
   // await loginpage.navigateTo()
    //await loginpage.login('momo123456','momo123')
    await pm.LoginPage.login('momo123456','momo123')

    //Home
    //const homepage= new HomePage(page)
    // await homepage.addProductToCart('Iphone 6 32gb')
    // await homepage.gotoCart()
    await page.waitForTimeout(20000)
    await pm.HomePage.addProductToCart('Iphone 6 32gb')
    await pm.HomePage.gotoCartPage()
    await page.waitForTimeout(20000)
    //Cart
   //const cartpage= new CartPage(page)
   //await page.waitForTimeout(3000)
   //const Status= await cartpage.checkProductInCart('Iphone 6 32gb')
   const Status= await pm.CartPage.checkProductInCart('Iphone 6 32gb')
   await expect(Status).toBe(true)

   await takescreen(page,'cart')

})
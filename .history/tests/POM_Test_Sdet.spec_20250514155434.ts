import { expect, Locator, Page,test } from '@playwright/test';
import { takescreen } from '../utils/screenshot-util';
import { PageManager } from '../page-objects-sdet/PageManager';

test('test', async ({page})=>{
    const pm= new PageManager(page)
    //Login

    //const loginpage= new LoginPage(page)
    await pm.LoginPage.navigateTo('https://www.demoblaze.com/index.html')
   // await loginpage.navigateTo()
    //await loginpage.login('momo123456','momo123')
    await pm.LoginPage.login('momo123456','momo123')

    //Home
    //const homepage= new HomePage(page)
    // await homepage.addProductToCart('Iphone 6 32gb')
    // await homepage.gotoCart()
   
    await pm.HomePage.addProductToCart('Nexus 6')
    await pm.HomePage.gotoCartPage()
  
    //Cart
   //const cartpage= new CartPage(page)
   //const Status= await cartpage.checkProductInCart('Iphone 6 32gb')
   const Status= await pm.CartPage.checkProductInCart('Iphone 6 32gb')
   await expect(Status).toBe(true)

   await takescreen(page,'Iphone6_checkout')
   await page.waitForTimeout(20000)

})
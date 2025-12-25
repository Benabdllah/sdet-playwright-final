//import { expect, Locator, Page,test } from '@playwright/test';
import { takescreen } from '../../utils/screenshot-util';
import { PageManager } from '../../page-objects-sdet/PageManager';
import { test, expect } from '../fixtures/fixtures_PageManager';


test('test', async ({page})=>{
    const pm= new PageManager(page)
    //Login

    //const loginPage= new LoginPage(page)
    await pm.LoginPage.navigateTo('https://www.demoblaze.com/index.html')

   // await loginPage.navigateTo()
    //await loginPage.login('momo123456','momo123')
    await pm.LoginPage.login('momo123456','momo123')


    //Home
    //const homepage= new HomePage(page)
    // await homepage.addProductToCart('Iphone 6 32gb')
    // await homepage.gotoCart()

    await pm.HomePage.addProductToCart2('Iphone 6 32gb')
    await pm.HomePage.gotoCartPage()

    //Cart
   //const cartPage= new CartPage(page)
   //const Status= await cartPage.checkProductInCart('Iphone 6 32gb')
   const status= await pm.CartPage.checkProductInCart('Iphone 6 32gb')
   expect(status).toBe(true)

   await takescreen(page,'Iphone6_checkout')

})

test('test mit fixture und pageManager', async ({pages,page})=>{

    //Login

    await pages.LoginPage.navigateTo('https://www.demoblaze.com/index.html')
    await pages.LoginPage.login('momo123456','momo123')


    //Home
    await pages.HomePage.addProductToCart2('Iphone 6 32gb')
    await pages.HomePage.gotoCartPage()

    //Cart

   const Status= await pages.CartPage.checkProductInCart('Iphone 6 32gb')
   expect(Status).toBe(true)

   await takescreen(pages.CartPage.page,'Iphone6_checkout_Fixture')

   // Screenshot direkt aus der Page in PageManager
    await pages.CartPage.page.screenshot({ path: 'screenshots/‚Iphone6_checkout_Fikture2.png' });


})

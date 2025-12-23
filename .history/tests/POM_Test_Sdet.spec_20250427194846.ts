import { expect, Locator, Page,test } from '@playwright/test';
import { LoginPage } from '../page-objects-sdet/LoginPage';
import { HomePage } from '../page-objects-sdet/HomePage';
import { CartPage } from '../page-objects-sdet/CartPage';
import { takescreen } from '../utils/screenshot-util';
import { PageManager } from '../page-objects-sdet/PageManager';

test('test', async ({page})=>{
    const pm= new PageManager(page)
    //Login

    //const loginpage= new LoginPage(page)
    await pm.login()
    await loginpage.navigateTo()
    await loginpage.login('momo123456','momo123')

    //Home
    //const homepage= new HomePage(page)
    await homepage.addProductToCart('Iphone 6 32gb')
    await homepage.gotoCart()
    //await page.waitForTimeout(3000)
    //Cart
   //const cartpage= new CartPage(page)
   //await page.waitForTimeout(3000)
   const Status= await cartpage.checkProductInCart('Iphone 6 32gb')
   await expect(Status).toBe(true)

   await takescreen(page,'cart')

})
import { Locator, Page,test } from '@playwright/test';
import { LoginPage } from '../page-objects-sdet/LoginPage';
import { HomePage } from '../page-objects-sdet/HomePage';
import { CartPage } from '../page-objects-sdet/CartPage';
import { takescreen } from '../utils/screenshot-util';

test('test', async ({page})=>{
    //Login

    const loginpage= new LoginPage(page)
    await loginpage.navigateTo()
    await loginpage.login('momo123456','momo123')

    //Home
    const homepage= new HomePage(page)
    await homepage.addProductToCart('Samsung galaxy s6')
    await homepage.gotoCart()
    //await page.waitForTimeout(3000)
    //Cart
   const cartpage= new CartPage(page)
   await page.waitForTimeout(3000)
   await cartpage.checkProductInCart('Samsung galaxy s6')
   await takescreen(page,'cart')

})
import { Locator, Page,test } from '@playwright/test';
import { LoginPage } from '../page-objects-sdet/LoginPage';
import { HomePage } from '../page-objects-sdet/HomePage';

test('test', async ({page})=>{
    //Login

    const loginpage= new LoginPage(page)
    await loginpage.navigateTo()
    await loginpage.login('momo123456','momo123')

    //Home
    const homepage= new HomePage(page)
    await homepage.addProductToCart('Samsung galaxy s5')
    await

    

})
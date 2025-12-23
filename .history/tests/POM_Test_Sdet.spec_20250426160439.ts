import { Locator, Page,test } from '@playwright/test';
import { LoginPage } from '../page-objects-sdet/LoginPage';

test('test', async ({page})=>{
    //Login

    const loginpage= new LoginPage(page)
    await loginpage.navigateTo()
    await loginpage.loginLink()
    await loginpage.login('pavan')



})
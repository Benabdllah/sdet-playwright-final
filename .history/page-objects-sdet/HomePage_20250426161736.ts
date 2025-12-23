import { Locator, Page } from '@playwright/test';

export class LoginPage {
    readonly cart : Locator;
    readonly productList : Locator;
    readonly addTocartBtn: Locator;

    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        this.productList = page.locator("//*{[@id='tbodyid']/div/div7div/h4/a");
        this.addTocartBtn = page.locator('//a[normalize-space]');
        this.cart = page.locator('#loginpassword');
 
    }

    async navigateTo() {
        await this.page.goto('https://www.demoblaze.com/index.html');
    }

    async login(username: string, password: string) {
        await this.loginLink.click();
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }
}


import { Locator, Page } from '@playwright/test';


export class LoginPage {
    readonly loginLink: Locator;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    
        this.loginLink = page.locator('#login2');
        this.usernameInput = page.locator('#loginusername');
        this.passwordInput = page.locator('#loginpassword');
        this.loginButton = page.locator("//button[normalize-space()='Log in']");
    }

    async navigateTo(url) {
       await this.page.goto(url);
    }
   

    async login(username: string, password: string) {
        await this.loginLink.click();
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }
}

export class LoginPageRecommended{
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }   


    async navigateTo(url: string) {
        await this.page.goto(url);
    }  
    
    async login(username: string, password: string) {
        await this.page.getByText('Log in').click();
        await this.page.getByPlaceholder('Username').fill(username);
        await this.page.getByPlaceholder('Password').fill(password);
        await this.page.getByRole('button', { name: 'Log in' }).click();
    }       


}
import { Locator, Page } from '@playwright/test';

export class LoginPage {
    readonly cart : Locator;
    readonly productList : Locator;
    readonly addTocartBtn: Locator;

    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        this.productList = page.locator("//*{[@id='tbodyid']/div/div7div/h4/a");
        this.addTocartBtn = page.locator('//a[normalize-space()"Add to cart"]');
        this.cart = page.locator('#carter');
 
    }

    

    async addProductToCart(productName: string) {
        const productList=
    }
}


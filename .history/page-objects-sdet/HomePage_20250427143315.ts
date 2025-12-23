import { Locator, Page } from '@playwright/test';

export class HomePage {
    readonly cart: Locator;
    readonly page: Page;
    readonly addToCartBtn:Locator

    constructor(page: Page) {
        this.page = page;
        this.cart = page.locator('#cartur');
        this.addToCartBtn=page.locator("//a[normalize-space()='Add to cart']")
    }

    get productList() {
        return this.page.locator("//*[@id='tbodyid']/div/div/div/h4/a");
    }
    //const addToCartBtn = this.page.locator("//a[normalize-space()='Add to cart']");

    async addProductToCart(productName: string) {
        const products = await this.productList.all();
        let productFound = false;

        for (const product of products) {
            const name = (await product.textContent())?.trim();
            if (name === productName) {
                productFound = true;
                console.log((`Perfekt :) 😎 Produkt ${productName} wurde auf der Seite gefunden!`));
                
                
                // Jetzt explizit auf Produkttitel auf der neuen Seite warten
                await product.click()//getByText(productName).click()
                break;
            }
            
        }
        if (!productFound) {
            console.log(`:( 😒Schade, Produkt ${productName} wurde nicht auf der Seite gefunden!`);
        }
       

        //const addToCartBtn = this.page.locator("//a[normalize-space()='Add to cart']");

        //await addToCartBtn.waitFor({ state: 'visible', timeout: 15000 });

        // Dialog-Handler vorbereiten
        this.page.once('dialog', async dialog => {
            if (dialog.message().includes('Product added')) {
                await dialog.accept();
            }
        });

        await this.addToCartBtn.click({ force: true });
    }

    async gotoCart() {
        await this.cart.click();
    }
}

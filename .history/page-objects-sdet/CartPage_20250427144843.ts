import { Locator, Page } from '@playwright/test';

export class CartPage {

    readonly page: Page;
    readonly cart: Locator;
    readonly addToCartBtn:Locator

    constructor(page: Page) {
        this.page = page;
        this.noOfProducts = page.locator('//tbody[@id="tbodyid"/]');
      
    }

    get productList() {
        return this.page.$$("//*[@id='tbodyid']/div/div/div/h4/a");
    }
    //const addToCartBtn = this.page.locator("//a[normalize-space()='Add to cart']");

    async addProductToCart(productName: string) {
        const products = await this.productList
        let productFound = false;

        for (const product of products) {
            const name = (await product.textContent())?.trim();
            if (name === productName) {
                productFound = true;
                console.log((`Perfekt 👍 😎 Produkt ${productName} wurde auf der Seite gefunden!`));
                
                
                // Jetzt explizit auf Produkttitel auf der neuen Seite warten
                await product.click()//getByText(productName).click()
                break;
            }
            
        }
        if (!productFound) {
            console.log(`😒 🤔 Schade, Produkt ${productName} wurde nicht auf der Seite gefunden!`);
        
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

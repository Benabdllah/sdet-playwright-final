import { Locator, Page } from '@playwright/test';
import { handleAlert } from '../utils/alert-utils';

export class HomePage {
    readonly cart: Locator;
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        this.cart = page.locator('#cartur'); // Warenkorb-Button
    }

    get productList() {
        return this.page.locator("//*[@id='tbodyid']/div/div/div/h4/a");
    }

    get addToCartBtn() {
        return this.page.locator("//a[normalize-space()='Add to cart']")
    }

    async addProductToCart(productName: string) {
        const products = await this.productList.all(); 

        let productFound = false;

        for (const product of products) {
            const name = (await product.textContent())?.trim();
            if (name === productName) {
                productFound = true;
                await product.click({ force: true });
                //await this.page.waitForLoadState('networkidle');

                 //await this.addToCartBtn.waitFor({ state: 'visible' }); // jetzt klappt es!
                break; // Nach Klick abbrechen
            }
        }

        if (!productFound) {
            throw new Error(`Produkt "${productName}" wurde nicht auf der Seite gefunden!`);
        }

        await this.page.on('dialog', async dialog => {
            if (dialog.message().includes('Product added.')) {
                await dialog.accept();
            }
        });

        await this.addToCartBtn.click({ force: true });
    }

    async gotoCart() {
        await this.cart.click();
    }
}

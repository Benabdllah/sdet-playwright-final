import { Locator, Page } from '@playwright/test';

export class HomePage {
    readonly cart: Locator;
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        this.cart = page.locator('#cartur');
    }

    get productList() {
        return this.page.locator("//*[@id='tbodyid']/div/div/div/h4/a");
    }

    async addProductToCart(productName: string) {
        const products = await this.productList.all();
        let productFound = false;

        for (const product of products) {
            const name = (await product.textContent())?.trim();
            if (name === productName) {
                productFound = true;
                
                await product.click({ force: true });

                // Trick: warte, bis "Add to cart" wirklich existiert
                await this.page.locator('div#more-information', { hasText: productName }).waitFor({ timeout: 15000 }).catch(() => {}); 

                // Alternativ: warte auf die Produktbeschreibung oder Preis
                await this.page.locator('div#tbodyid').waitFor({ timeout: 15000 }).catch(() => {});

                break;
            }
        }

        if (!productFound) {
            throw new Error(`Produkt "${productName}" wurde nicht auf der Seite gefunden!`);
        }

        const addToCartBtn = this.page.locator("//a[normalize-space()='Add to cart']");

        await addToCartBtn.waitFor({ state: 'visible', timeout: 15000 });

        this.page.once('dialog', async dialog => {
            if (dialog.message().includes('Product added')) {
                await dialog.accept();
            }
        });

        await addToCartBtn.click({ force: true });
    }

    async gotoCart() {
        await this.cart.click();
    }
}

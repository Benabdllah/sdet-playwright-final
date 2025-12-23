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
                
                await Promise.all([
                    this.page.waitForLoadState('domcontentloaded'),
                    product.locator('.hrefch', { hasText: productName }).click({ force: true }),
                ]);

                // Jetzt explizit auf Produkttitel auf der neuen Seite warten
                await this.page.locator('h2.name', { hasText: productName })
                break;
            }
        }

        if (!productFound) {
            throw new Error(`Produkt "${productName}" wurde nicht auf der Seite gefunden!`);
        }

        const addToCartBtn = this.page.locator("//a[normalize-space()='Add to cart']");

        //await addToCartBtn.waitFor({ state: 'visible', timeout: 15000 });

        // Dialog-Handler vorbereiten
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

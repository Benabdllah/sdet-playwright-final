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

                // Gleichzeitig Navigation und Klick abwarten
                await Promise.all([
                    this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
                    product.click({ force: true }),
                ]);

                break;
            }
        }

        if (!productFound) {
            throw new Error(`Produkt "${productName}" wurde nicht auf der Seite gefunden!`);
        }

        // WICHTIG: Auf den "Add to cart" Button warten
        await this.page.waitForSelector("//a[normalize-space()='Add to cart']", { timeout: 10000 });
        const addToCartBtn = this.page.locator("//a[normalize-space()='Add to cart']");

        // Dialog-Handler vorbereiten (nur einmal, NICHT jedes Mal neu registrieren!)
        this.page.once('dialog', async dialog => {
            if (dialog.message().includes('Product added')) {
                await dialog.accept();
            }
        });

        // Jetzt sicher klicken
        await addToCartBtn.click({ force: true });
    }

    async gotoCart() {
        await this.cart.click();
    }
}

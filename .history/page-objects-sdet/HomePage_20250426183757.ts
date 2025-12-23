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
        return this.page.locator("//a[normalize-space()='Add to cart']");
    }

    async addProductToCart(productName: string) {
        const products = await this.productList.all();

        let productFound = false;

        for (const product of products) {
            const name = (await product.textContent())?.trim();
            if (name === productName) {
                productFound = true;

                // Navigation abwarten
                await Promise.all([
                    this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
                    product.click({ force: true })
                ]);

                break;
            }
        }

        if (!productFound) {
            throw new Error(`Produkt "${productName}" wurde nicht auf der Seite gefunden!`);
        }

        // WICHTIG: Neuen Locator erstellen NACH Navigation
        const addToCartBtn = this.page.locator("//a[normalize-space()='Add to cart']");

        await addToCartBtn.waitFor({ state: 'visible' });

        // Dialog-Handler einmalig registrieren
        this.page.once('dialog', async dialog => {
            if (dialog.message().includes('Product added')) {
                await dialog.accept();
            }
        });

        // Button klicken
        await addToCartBtn.click({ force: true });
    }

    async gotoCart() {
        await this.cart.click();
    }
}


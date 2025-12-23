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

                // ⬇️ Wichtig: Klick + Navigation abwarten!
                await Promise.all([
                    this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
                    product.click({ force: true })
                ]);

                // Warten bis Add-to-Cart-Button sichtbar
                await this.addToCartBtn.waitFor({ state: 'visible' });

                break; // Nach Klick abbrechen
            }
        }

        if (!productFound) {
            throw new Error(`Produkt "${productName}" wurde nicht auf der Seite gefunden!`);
        }

        // Dialog-Handler vorbereiten
        this.page.once('dialog', async dialog => {
            if (dialog.message().includes('Product added')) {
                await dialog.accept();
            }
        });

        // Jetzt Add-to-Cart klicken
        await this.addToCartBtn.click({ force: true });
    }

    async gotoCart() {
        await this.cart.click();
    }
}

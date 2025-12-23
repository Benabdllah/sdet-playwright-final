import { Locator, Page } from '@playwright/test';

export class HomePage {
    readonly cart: Locator;
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        this.cart = page.locator('#cartur'); // Korrekt: Warenkorb-Button
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
                await product.click({ force: true });
               // await this.page.waitForLoadState('networkidle'); // warten bis Seite fertig
                break; // Wichtig: Loop beenden!
            }
        }

        if (!productFound) {
            throw new Error(`Produkt "${productName}" wurde nicht auf der Seite gefunden!`);
        }

        // Dialog vorbereiten VOR dem Klick
        const dialogPromise = this.page.waitForEvent('dialog');

        await this.addToCartBtn.click();

        const dialog = await dialogPromise;
        if (dialog.message().includes('added')) {
            await dialog.accept();
        }
    }

    async gotoCart() {
        await this.cart.click();
    }
}

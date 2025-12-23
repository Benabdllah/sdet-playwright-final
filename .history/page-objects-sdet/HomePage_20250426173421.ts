import { Locator, Page } from '@playwright/test';

export class HomePage {
    readonly cart: Locator;
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        this.cart = page.locator('#cartur'); // Richtig: cartur für den Warenkorb-Button auf Demoblaze
    }

    // Dynamischer Getter für die Produktliste
    get productList() {
        return this.page.locator("//*[@id='tbodyid']/div/div/div/h4/a");
    }

    get addToCartBtn() {
        return this.page.locator("//a[normalize-space()='Add to cart']");
    }

    async addProductToCart(productName: string) {
        const products = await this.productList.all(); // .all() für alle gefundenen Elemente

        let productFound = false;

        for (const product of products) {
            const name = await product.textContent();

            if (name?.trim() === productName) {
                productFound = true;
                await product.click({force:true})}}
            if (!productFound) {
            throw new Error(`Produkt "${productName}" wurde nicht auf der Seite gefunden!`)}


            await this.page.waitForTimeout(1000); // Warten, bis Seite nach Klick geladen ist

            await this.page.on('dialog', async dialog=>{

                if (dialog.message().includes('added')) {
                await dialog.accept()
            }  
        })
        await this.addToCartBtn.click({force:true});

        
       }
    
    

    async gotoCart() {
        await this.cart.click();
    }
}

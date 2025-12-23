import { Locator, Page } from '@playwright/test';
import { LoginPage } from './LoginPage';

export class HomePage extends LoginPage
{
    readonly page: Page;
    readonly cart: Locator;
    readonly addToCartBtn:Locator

    constructor(page: Page) {
        super(page)
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
                console.log((`Schritt 1 erfolgreich: Perfekt 👍 😎 Produkt ${productName} wurde auf der Seite gefunden!`));
                
                
                // Jetzt explizit auf Produkttitel auf der neuen Seite warten
                await product.click()
                //getByText(productName).click()
                break;
            }
            
        }
        if (!productFound) {
            console.log(`Schritt 1 Schade 😒 🤔 , Produkt ${productName} wurde nicht auf der Seite gefunden!`);
        
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

    async gotoCartPage() {
        await this.cart.click();
        await this.page.waitForTimeout(1000)
    }
}

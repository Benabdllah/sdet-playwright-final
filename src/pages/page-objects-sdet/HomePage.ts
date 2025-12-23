import { Locator, Page } from '@playwright/test';
import { LoginPage ,LoginPageRecommended} from './LoginPage';
import { handleAlert, handlePrompt } from '../utils/alert-utils';     

export class HomePage extends LoginPage
{
    //readonly page: Page;
    readonly cart: Locator;
    readonly addToCartBtn:Locator;


    constructor(page: Page) {
        super(page)
        //this.page = page;
        this.cart = page.locator('#cartur');
        this.addToCartBtn=page.locator("//a[normalize-space()='Add to cart']")//normalize-space() entfernt führende und nachfolgende Leerzeichen
     
    }

    get productList() {
        return this.page.locator("//*[@id='tbodyid']/div/div/div/h4/a").all();
    }
    
    //const addToCartBtn = this.page.locator("//a[normalize-space()='Add to cart']");

    async addProductToCart(productName: string) {
        const products = await this.productList
        let productFound = false;
        await this.page.waitForTimeout(500)
        for (const product of products) {
            const name = (await product.textContent())?.trim();
            if (name === productName) {
                productFound = true;
                console.log(`✅ Das Produkt "${productName}" wurde auf der Seite gefunden.`);
                
                
                // Jetzt explizit auf Produkttitel auf der neuen Seite warten
                //await product.click()
                await product.getByText(productName).click({ force: true })
                //getByText(productName).click()
                break;
            }
            
        }
        if (!productFound) {
            console.log(`❌ Das Produkt "${productName}" wurde NICHT auf der Seite gefunden.`);
        
        }
       
    
        //const addToCartBtn = this.page.locator("//a[normalize-space()='Add to cart']");

        //await addToCartBtn.waitFor({ state: 'visible', timeout: 15000 });

        // Dialog-Handler vorbereiten
        this.page.once('dialog', async dialog => {
            if (dialog.message().includes('Product added')) {
                await dialog.accept();
            }
        });
        
        await this.addToCartBtn.getByText('Add to cart').click({ force: true });
    }

    async gotoCartPage() {
        await this.cart.click();
        await this.page.waitForTimeout(1000)
    }
}


export class HomePageRecommended extends LoginPageRecommended{
   constructor(page: Page) {
        super(page)
    }   
    get productList() {
        return this.page.locator("//*[@id='tbodyid']/div/div/div/h4/a");
    }   
    async addProductToCart(productName: string) {
        const products = await this.productList.all();
        let productFound = false;

        await this.page.waitForTimeout(500) 
        for (const product of products) {
            const name = (await product.textContent())?.trim(); //textContent() gibt den Textinhalt eines Elements zurück
            if (name === productName) {
                productFound = true;

                console.log(`✅ Das Produkt "${productName}" wurde auf der Seite gefunden.`);

                // Jetzt explizit auf Produkttitel auf der neuen Seite warten
                await product.click({ force: true }) // getbytext sucht nach einem Element mit dem angegebenen Textinhalt innerhalb des Produkts und klickt darauf
                break;
            }
        }
        if (!productFound) {
            console.log(`❌ Das Produkt "${productName}" wurde NICHT auf der Seite gefunden.`);
        }
        

        
        // Dialog-Handler vorbereiten
        this.page.once('dialog', async dialog => {
            if (dialog.message().includes('Product added')) {   
                await dialog.accept();
            }
        });
        await this.page.getByText('Add to cart').click({ force: true });
    }   
// Option2 nicht in der schleife funktioniert nicht
    async addProductToCart2(productName: string) {
    // Einen Locator auf das Produkt mit dem angegebenen Text erstellen
    const product = this.productList.filter({ hasText: productName })
    
    // Warten, bis das Produkt sichtbar ist
    const count = await product.count();
    if (count === 0) {
        console.log(`❌ Das Produkt "${productName}" wurde NICHT auf der Seite gefunden.`.toUpperCase());
        return;
    }
    //await product.first().locator('text=' + productName).click({ timeout: 5000 });
     // Das erste sichtbare Produkt auswählen
    const firstProduct = product.first();
    await firstProduct.waitFor({ state: 'visible', timeout: 5000 });

    // Scrollen, um sicherzustellen, dass das Element klickbar ist
    await firstProduct.scrollIntoViewIfNeeded();

    // Klick auf das Produkt
    await firstProduct.click();


    console.log(`✅ Das Produkt "${productName}" wurde auf der Seite gefunden.`);

    // Auf das Produkt klicken, um die Produktseite zu öffnen
    
    console.log(`➡️ Navigiere zur Produktseite von "${productName}".`);

    //handlePrompt(this.page,'Product added', true);
    // Dialog-Handler vorbereiten
    this.page.once('dialog', async dialog => {
        if (dialog.message().includes('Product added')) {
            await dialog.accept();
            console.log('✔️ Dialog "Product added" bestätigt.');
        }
    });

    // "Add to cart" klicken
    
    //await this.page.getByText('Add to cart').click({ force: true });
    const addToCartBtn = this.page.getByText('Add to cart', { exact: true });
    await addToCartBtn.waitFor({ state: 'visible', timeout: 1000 });
    await addToCartBtn.click({ force: true });
    console.log('✔️ "Add to cart" Button geklickt.');


}
    async gotoCartPage() {
        const cartBtn=this.page.locator('#cartur');
        await cartBtn.waitFor({ state: 'visible', timeout: 10000 });
        await cartBtn.click();
        await this.page.waitForTimeout(1000)
    }
}
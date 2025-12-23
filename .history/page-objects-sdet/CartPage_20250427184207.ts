import { Locator, Page } from '@playwright/test';

export class CartPage {

    readonly page: Page;
    //readonly noOfProducts: Locator;


    constructor(page: Page) {
        this.page = page;
        //this.noOfProducts = page.locator('//tbody[@id="tbodyid"/tr/td[2]]');
    }

    get noOfProducts(){
        return this.page.la("//tbody[@id='tbodyid']/tr/td[2]")
    }
    //const addToCartBtn = this.page.locator("//a[normalize-space()='Add to cart']");

    async checkProductInCart(productName: string) {
        const productsInCart =await this.noOfProducts
        let productsFound = false;

        for (const product of productsInCart) {
            const name = (await product.textContent())?.trim();
            if (name === productName) {
                productsFound = true;
                console.log((`Perfekt 👍 😎 Produkt ${productName} wurde in dem Einkaufswagen gefunden!`));
                return true
                break            
            }
            
        }
        if (!productsFound) {
            console.log(`😒 🤔 Schade, Produkt ${productName} wurde nicht in dem Einkaufswagen gefunden!`);
        
        }
       
    }}

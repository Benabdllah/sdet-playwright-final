import { Locator, Page } from '@playwright/test';

export class HomePage {
    readonly cart : Locator;
    readonly productList : Locator;
    readonly addTocartBtn: Locator;

    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        this.productList = page.locator("//*[@id='tbodyid']/div/div7div/h4/a").all();
        this.addTocartBtn = page.locator("//a[normalize-space()='Add to cart']")

        this.cart = page.locator('#carter');
 
    }

    

    async addProductToCart(productName: string) {
        const productList= await this.productList
        for (const product of productList)
        {
            if (productName == await product.textContent()){
                await product.click()
                break
            }
        }
        await this.page.on('dialog', async dialog =>{
            if(dialog.message().includes('added')){
                await dialog.accept()
            }
        })
        await this.addTocartBtn.click()

    }
    async gotoCart(){
        await this.cart.click()

    }
}


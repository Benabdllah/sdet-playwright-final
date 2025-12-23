import { Locator, Page } from '@playwright/test';
import { HomePage } from './HomePage';

export class CartPage extends HomePage {
  readonly page: Page;
  readonly noOfProducts: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.noOfProducts = page.locator('//tbody[@id="tbodyid"]/tr/td[2]');
  }

  async checkProductInCart(productName: string) {
    const count = await this.noOfProducts.count();
    let productsFound = false;

    for (let i = 0; i < count; i++) {
      const product = this.noOfProducts.nth(i);
      const name = (await product.textContent())?.trim();

      if (name === productName) {
        productsFound = true;
        console.log(`✅ Produkt "${productName}" wurde im Einkaufswagen gefunden.`);
        return true;
      }
    }

    if (!productsFound) {
      console.log(`❌ Produkt "${productName}" wurde NICHT im Einkaufswagen gefunden.`);
    }
    return false;
  }
}

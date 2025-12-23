import { Page, expect } from '@playwright/test';

export class HelperBase {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(url: string) {
    await this.page.goto(url);
  }

  async clickLocatorMitText(locator: string, text: string) {
    await this.page.locator(locator).getByText(text).click();
  }
  async click(locator: string) {
    await this.page.getByText(text).click({ force: true });
  }

  async type(locator: string, text: string) {
    await this.page.locator(locator).fill(text);
  }

  async assertText(locator: string, expected: string) {
    const text = await this.page.locator(locator).textContent();
    expect(text?.trim()).toBe(expected);
  }
}

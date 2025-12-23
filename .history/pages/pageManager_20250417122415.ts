import { Page } from '@playwright/test';
import { NavigationPage } from './navigationPage';

export class PageManager {
  private page: Page;
  private navigationPage: NavigationPage;

  constructor(page: Page) {
    this.page = page;
    this.navigationPage = new NavigationPage(page);
  }

  getNavigationPage(): NavigationPage {
    return this.navigationPage;
  }
}

import { test as base, Page } from '@playwright/test';
import { PageManager } from '../page-objects-sdet/PageManager';

// 1. Typ für die Fixture definieren
type PagesFixture = {
  pages: PageManager;
};

// 2. base.extend mit Typ
export const test = base.extend<PagesFixture>({
  pages: async ({ page }, use) => {
      const pages = new PageManager(page);
      await use(pages);
  }
});
// Exportiere auch expect
export const expect = test.expect;

// tests/any-test.spec.ts
import { test, expect } from '../fixtures/configFixture';

test('Login funktioniert', async ({ page, plConfig }) => {
  await page.goto(plConfig.URL);
  await page.fill('[data-testid="email"]', plConfig.USER_MAIL);
  await page.fill('[data-testid="password"]', plConfig.USER_PASSWORD);
  // ... perfekter TypeScript-Support + Cache + Validation + async-ready
});
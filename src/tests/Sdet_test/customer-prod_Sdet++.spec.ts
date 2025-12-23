// tests/customer-prod.spec.ts – mit expliziter Rolle + anderem PrivateLabel
import { test } from '../fixtures';

test.use({ authRole: 'customer' });

test('Kunde sieht nur seine Rechnungen @smoke', async ({ authPage, plConfig }) => {
  const { page } = authPage;
  // plConfig kommt automatisch aus deinem SecretsManager-Fixture!
});
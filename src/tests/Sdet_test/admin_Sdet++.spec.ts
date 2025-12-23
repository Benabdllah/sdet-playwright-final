import { test } from '../../fixtures';

test('als Admin bei VW', async ({ authPage, plConfig }) => {
  const { page } = authPage;                         // ← korrekt destrukturiert

  await expect(page).toHaveURL(plConfig.URL + '/admin');
  // oder noch besser:
  await expect(page).toHaveURL(new RegExp('/admin'));
});

test('als Admin bei VW', async ({ authPage, plConfig }) => {
  const { page } = authPage;

  await expect(page).toHaveURL(plConfig.URL);
  await expect(page.getByText('Volkswagen Meetings')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Admin-Bereich' })).toBeVisible();
});

// 1. Standard – überall
test('Kunde sieht Buchung', async ({ authPage, plConfig }) => {
  const { page } = authPage;
  // ...
});

// 2. Wenn du den Context brauchst (z. B. für Cookies setzen)
test('Cookie Test', async ({ authPage }) => {
  const { page, context } = authPage;
  await context.addCookies([{ name: 'debug', value: '1', domain: '.meetago.com', path: '/' }]);
});

// 3. Wenn du in einer Datei nur Admin-Tests hast
test.describe('Admin Suite', () => {
  test('Admin löscht User', async ({ authPage }) => {
    const { page: adminPage } = authPage;   // ← nur hier erlaubt!
    await adminPage.getByText('Löschen').click();
  });
});
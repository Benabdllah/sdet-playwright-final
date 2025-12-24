// tests/booking.spec.ts
import { test } from '../fixtures';

test('Buchung als Kunde – blitzschnell + offline', async ({ harContext, plConfig }) => {
  const { page } = harContext;

  // Alles aus HAR → < 3 Sekunden, 0 Flakiness
  await page.getByText('Hotel suchen').click();
  await page.fill('input[placeholder="Ort"]', 'Berlin');
  await page.getByRole('button', { name: 'Suchen' }).click();

  await expect(page.getByText('Hotel Adlon')).toBeVisible();
});
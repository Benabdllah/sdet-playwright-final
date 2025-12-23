import { test, expect } from '@playwright/test';

test('Upload File', async ({ page }) => {
    await page.goto('https://testautomationpractice.blogspot.com/');
    await page.locator('#singleFileInput').click();
    await page.locator('#singleFileInput').setInputFiles('Snakefile.py');
    await page.getByRole('button', { name: 'Upload Single File' }).click();
    await page.getByRole('button', { name: 'Upload Single File' }).click();
});

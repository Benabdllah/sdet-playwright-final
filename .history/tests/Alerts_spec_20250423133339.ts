import { test, expect } from '@playwright/test';
import { handleAlert } from '../utils/alert-utils';
import { takescreen } from '../utils/screenshot-util';

test('Alert with Ok', async ({page }) => {
 
  // 1. Seite laden
await page.goto('https://testautomationpractice.blogspot.com/')

  //Enabling alert handling //Dialog window handler
await handleAlert(page,'accept','I am an alert box!')
takescreen(page,'Alert')
page.wa

})

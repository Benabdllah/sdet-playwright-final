import { test, expect } from '@playwright/test';
import { handleAlert } from '../utils/alert-utils';
import { takescreen } from '../utils/screenshot-util';

test('Alert with Ok', async ({page }) => {
 
  // 1. Seite laden
await page.goto('https://testautomationpractice.blogspot.com/')

  //Enabling alert handling //Dialog window handler
// await handleAlert(page,'accept','I am an alert box!')
// await page.click('#alertBtn')

// page.on('dialog',async dialog=>{
//   expect(dialog.type()).toContain('alert')
//   expect(dialog.message()).toContain('I am an alert box!')
//   await dialog.accept()
// })
// await page.click('#alertBtn')

//Enabling dialog window handler
// page.on('dialog',async dialog=>{
//   expect(dialog.type()).toContain('confirm')
//   expect(dialog.message()).toContain('Press a button!')
//   await dialog.accept()
// })
await handleAlert(page,'accept','Press a button!')
await page.click('#confirmBtn')
await expect(page.locator('#demo')).toHaveText('You pressed OK!')

 await page.waitForTimeout(5000)

})

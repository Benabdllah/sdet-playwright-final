import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('Alerts', async ({page }) => {
 
  // 1. Seite laden
  await page.goto('https://testautomationpractice.blogspot.com/')

  //Enabling alert handling 


})

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import {selectDropdownOption} from '../../utils/dropdown-utils';
 import { takescreen } from '../../utils/screenshot-util';


test('handel dropDowns', async ({page}) => {
 
 // 1. Seite laden
  await page.goto('https://testautomationpractice.blogspot.com/')

 // Multiple way to select option from dropdown
 await page.locator("#country").selectOption({label:'United Kingdom'}) //label/visible// label interpritiert als sichtbarer text
 await page.locator("#country").selectOption('India') //visible text
 await page.locator("#country").selectOption({value:'uk'}) //value
 await page.locator("#country").selectOption({index:0}) //by using index
 await page.selectOption('#country','uk') //by text! value

 //Assertion
 //3) check number of options in dropdaown -Approach1
 const options=await page.$$('#country option')



 console.log("Number of option:", options.length)

 //4) check presence of value ichtbarer text in the dropdown -Approach 1
  const content= await page.locator('#country').textContent()
  expect(content.includes('United Kingdom')).toBeTruthy()
  expect(content.includes('Meghrib')).toBeFalsy()

  // 4.2 approach 2 - get all texts of dropdown
    options.map(el => el.textContent())
    const texts = await Promise.all(options.map(el => el.textContent()));
    const content2 = (texts.join(' ')?.trim());

    console.log('Dropdown-Inhalt:', content2);
    // Dropdown-Inhalt als Liste ausgeben
    console.log('Dropdown-Inhalt-List:');
    texts.forEach((text, index) => {
    console.log(`${index + 1}. ${text?.trim()}`);  // trim entfernt unnötige Leerzeichen
    });
    console.log('Dropdown-Inhalt:', texts.map(t => t?.trim()));

    expect(content2.includes('Canada')).toBeTruthy()

  //5) check presence of value in the dropown -Approach 2- using looping
  let status= false
  for (const opt of options)
    {
    let value=await opt.textContent()
    if (value.includes('France')){
        status=true
        break
    }

     }
     expect(status).toBeTruthy()
 
  
  //5 select option from dropdown using loop
  const targetOption = 'India'; // Das was du auswählen möchtest
  let optionFound = false;

  const options2 = await page.$$('#country option')
  for (const option of options2) {
    const text = await option.textContent();
    if (text?.trim() === targetOption) {
      optionFound = true;
      break;
    }
  }

  // Sicherstellen, dass Option existiert
  expect.soft(optionFound).toBeTruthy();

  // Jetzt die Option sicher auswählen
  //await page.selectOption('#country', { label: targetOption })
  
  
  await selectDropdownOption(page,'#country','France')
  await takescreen(page,'dropdown-selection_france.png')

  await page.close();

  
  
});

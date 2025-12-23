import { test, expect } from '@playwright/test';

test('Navigation Test', async ({ page }) => {
    
  await page.goto('https://www.pavanonlinetrainings.com/p/udemy-courses.html');

  // Warte darauf, dass das iFrame geladen ist
 

  ? page.frame({ name: pavanonlinetrainings })//Wenn der identifier ein String ist, versucht Playwright ein Frame mit dem Namen identifier zu finden.
    || page.frame({ url: new RegExp(pavanonlinetrainings) })//? Das ist ein Ternary Operator. Wenn die Bedingung wahr ist (true), wird der erste Teil ausgeführt; andernfalls der zweite Teil.
      : page.frame({ url: pavanonlinetrainings });
  const frame = page.frame({ url: /pavanonlinetrainings/ });
  await frame.getByRole('button', { name: 'YouTube' }).click({force:true});
})  

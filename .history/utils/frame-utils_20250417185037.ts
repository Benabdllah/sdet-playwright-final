import { Page, Frame } from '@playwright/test';

/*export async function switchToFrame(page: Page, frameNameOrId: string): Promise<Frame> {
  const frame = page.frame({ name: frameNameOrId }) || page.frame({ url: new RegExp(frameNameOrId) });
  if (!frame) {
    throw new Error(`❌ Frame mit Name oder URL "${frameNameOrId}" nicht gefunden!`);
  }
  return frame;
}
*/
export async function switchToFrame(page: Page, identifier: string | RegExp): Promise<Frame> {
    const frame = typeof identifier === 'string'//Prüft, ob der übergebene identifier ein String ist (z. B. "frameName" oder "someUrl")
      ? page.frame({ name: identifier })//Wenn der identifier ein String ist, versucht Playwright ein Frame mit dem Namen identifier zu finden.
    || page.frame({ url: new RegExp(identifier) })//? Das ist ein Ternary Operator. Wenn die Bedingung wahr ist (true), wird der erste Teil ausgeführt; andernfalls der zweite Teil.
      : page.frame({ url: identifier });//Wenn der identifier kein String, sondern ein RegExp-Objekt ist, sucht Playwright direkt ein Frame mit einer URL, die auf die RegExp passt.
  
    if (!frame) {
      throw new Error(`❌ Frame mit Bezeichnung "${identifier}" wurde nicht gefunden.`);
    }
  
    return frame;
    pa
  }
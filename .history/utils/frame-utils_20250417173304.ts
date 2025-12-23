import { Page, Frame } from '@playwright/test';

/*export async function switchToFrame(page: Page, frameNameOrId: string): Promise<Frame> {
  const frame = page.frame({ name: frameNameOrId }) || page.frame({ url: new RegExp(frameNameOrId) });
  if (!frame) {
    throw new Error(`❌ Frame mit Name oder URL "${frameNameOrId}" nicht gefunden!`);
  }
  return frame;
}
*/
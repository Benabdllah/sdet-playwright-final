import { Page } from '@playwright/test';

/**
 * Gibt alle vorhandenen Frames mit Name und URL aus.
 * 
 * @param page - Playwright Page Objekt
 */
export async function listAllFrames(page: Page): Promise<void> {
  const frames = page.frames();
  console.log(`🔎 Gesamtanzahl Frames: ${frames.length}`);
  
  frames.forEach((frame, index) => {
    console.log(`\n🖼️ Frame #${index + 1}`);
    console.log(`Name : ${frame.name() || '❌ Kein Name'}`);
    console.log(`URL  : ${frame.url()}`);
  });
}

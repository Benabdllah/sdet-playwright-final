// global-setup.ts
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';


export default async ({browser}) => {
        const context = await browser.newContext({ recordVideo: { dir: 'test-results/videos/' } });
        const page = await context.newPage();
        await page.goto('https://example.com');
        await page.waitForTimeout(1000); // Testschritte ...
      
        const video = page.video(); // Merken vor Schließen!
        await context.close(); // 🔴 Wichtig: Erst jetzt ist das Video vollständig!
      
        // Pfad abfragen & verschieben
        const videoPath = await video?.path();
        if (videoPath) {
          const targetPath = path.resolve('playwright-report/videos', path.basename(videoPath));
          fs.mkdirSync(path.dirname(targetPath), { recursive: true });
          fs.renameSync(videoPath, targetPath);
          console.log('🎬 Video verschoben nach:', targetPath);
        }
    ]
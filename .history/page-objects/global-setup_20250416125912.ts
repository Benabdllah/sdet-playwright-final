// global-setup.ts
import * as fs from 'fs';
import * as path from 'path';

export default async () => {
  /*const dateStr = new Date().toISOString().split('T')[0]; // z. B. 2024-04-16
  const videoDir = path.resolve(`test-results/videos/${dateStr}`);

  fs.mkdirSync(videoDir, { recursive: true });
  process.env.PW_VIDEO_DIR = videoDir;*/
  const context = await browser.newContext({
    recordVideo: { dir: 'test-results/videos' }
  const video = page.video();
  await context.close()
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-'); // z. B. 2024-04-14T20-45-12-345Z
    const filename = `testvideo-${timestamp}.webm`;
    const savePath = path.resolve('playwright-report/videos', filename);

    fs.mkdirSync(path.dirname(savePath), { recursive: true });
    await video.saveAs(savePath);
};

// global-setup.ts
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export default async ({bro}) => {
  /*const dateStr = new Date().toISOString().split('T')[0]; // z. B. 2024-04-16
  const videoDir = path.resolve(`test-results/videos/${dateStr}`);

  fs.mkdirSync(videoDir, { recursive: true });
  process.env.PW_VIDEO_DIR = videoDir;*/
  const context = await browser.newContext({ recordVideo: { dir: 'test-results/videos/' } });
  const page = await context.newPage();
  const videoPath = await video?.path()
  const targetPath = path.resolve('playwright-report/videos', path.basename(videoPath));
fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.renameSync(videoPath, targetPath);
};

// global-setup.ts
import fs from 'fs';
import path from 'path';

export default async () => {
  const dateStr = new Date().toISOString().split('T')[0]; // z. B. 2024-04-16
  const videoDir = path.resolve(`test-results/videos/${dateStr}`);

  fs.mkdirSync(videoDir, { recursive: true });
  process.env.PW_VIDEO_DIR = videoDir;
};

import { defineConfig } from '@playwright/test';
//import * as dotenv from 'dotenv'; // ✅ Jetzt korrekt importiert

dotenv.config(); // ✅ Funktioniert jetzt fehlerfrei

export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  use: {
    headless: false,
    viewport: null,
    video: 'retain-on-context-close',
    recordVideo: {
      dir: process.env.PW_VIDEO_DIR || 'test-results/videos',
      size: { width: 1920, height: 1080 },
    },
    launchOptions: {
      args: ['--start-fullscreen'],
    },
  },
  reporter: [['html']],
});

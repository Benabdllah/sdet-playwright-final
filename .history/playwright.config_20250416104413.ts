import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config(); // Falls du später mit .env arbeitest

export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  use: {
    headless: false,
    video: 'on',
    recordVideo: {
      dir: process.env.PW_VIDEO_DIR || 'test-results/videos',
    },
    launchOptions: {
      args: ['--start-fullscreen'],
    },
    viewport: null, // nutzt echten Bildschirm
  },
  reporter: [['html']],
});

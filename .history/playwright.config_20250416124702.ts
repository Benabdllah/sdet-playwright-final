import { defineConfig } from '@playwright/test';
//import * as dotenv from 'dotenv';

//dotenv.config();

export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  use: {
    headless: false,
    viewport: null,
    video: {
      mode: 'retain-on-failure', // ✅ NEU: video als Objekt
      dir:'test-results/videos',
      
    },
    launchOptions: {
      args: ['--start-fullscreen'],
    },
  },
  reporter: [['html']],
});

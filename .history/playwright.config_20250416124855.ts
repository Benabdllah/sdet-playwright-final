import { defineConfig } from '@playwright/test';

export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  use: {
    headless: false,
    viewport: null,
    video: 'retain-on-failure', // ✅ einfach als string setzen
    recordVideo: {
      dir: 'test-results/videos',
      size: { width: 1920, height: 1080 },
    },
    launchOptions: {
      args: ['--start-fullscreen'],
    },
  },
  reporter: [['html']],
});

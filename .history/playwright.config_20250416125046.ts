import { defineConfig } from '@playwright/test';

export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  use: {
    headless: false,
    viewport: null,
    video: 'retain-on-failure', // ✅ das reicht!
    launchOptions: {
      args: ['--start-fullscreen'],
    },
  },
  reporter: [['html']],
});

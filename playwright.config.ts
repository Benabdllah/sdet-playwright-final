import { tr } from '@faker-js/faker/.';
import { defineConfig, devices } from '@playwright/test';
import { getRoleTag } from './src/config/roleFilter';
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const SELECTED_ROLE = process.env.ROLE || 'guest';  // <-- der heilige Schalter
export default defineConfig({
  grep: (() => {
    switch (SELECTED_ROLE) {
      case 'admin':     return /@admin/;
      case 'customer':  return /@customer/;
      case 'supporter': return /@supporter/;
      case 'genehmiger':return /@genehmiger/;
      case 'guest':     return /@guest/;
      default:          return /./; // alles (nur für lokale Entwicklung)
    }
  })(),

  // Optional: noch sauberer – komplett auslagern
  // grep: getRoleTag(),
  timeout: 60_000,
  globalTimeout: 3_600_000, // 1 hour for CI to complete all tests
  testDir: 'src/tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. workers: process.env.CI ? '50%' : 4,*/ 
  workers: process.env.CI ? 1 : undefined,//workers: process.env.CI ? '40%' : 8,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],  // Konsolenausgabe
    ['html', { open: 'never', outputFolder: 'playwright-report'}],
    //['json', { outputFile: 'playwright/reports/results.json' }],
    ['junit', { outputFile: 'test-results/junit-report.xml'}],
    //['blob', { outputDir: 'playwright/reports/blob' }],
    //['junit', { outputFile: `playwright/results/junit-${SELECTED_ROLE}.xml` }]
  
    //['./reporters/slack-reporter.ts'] // eigener Reporter
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',or baseURL: process.env.PL_URL,
    headless:true,
   //viewport: { width: 1280, height: 720 },
   viewport: { width: 1920, height: 1080 },
   video: 'retain-on-failure',
    ignoreHTTPSErrors: true,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    screenshot: 'only-on-failure',
    trace: 'on',//'on-first-retry'oder 'retain-on-failure' wenn du Speicher sparen willst
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
  },
  outputDir: 'playwright/test-results',  // ← Standard, nicht ändern!

  /* Configure projects for major browsers , projects: generateShardProjects(20), // dynamisch 20 Shards*/ 
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'],
   
      headless:true
       },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] ,
        headless:true

      },
    },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
  // playwright.config.ts – Projekt-spezifische Rollen
// {
//   name: 'admin-tests',
//   use: {
//     authRole: 'admin' as const,
//     private_label: 'bank_admin_prod'
//   }
// },
// {
//   name: 'customer-tests',
//   use: {
//     authRole: 'customer' as const,
//     private_label: 'customer_123_prod'
//   }
// }
});

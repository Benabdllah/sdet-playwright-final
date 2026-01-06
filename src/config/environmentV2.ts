import * as dotenv from "dotenv";
import * as path from "path";
import { SecretsManager } from "./secrets/SecretsManager";

// Lade .env.secrets für lokale Entwicklung
if (process.env.NODE_ENV !== "production") {
  const envPath = path.resolve(__dirname, "../../.env.secrets");
  dotenv.config({ path: envPath });
}

// Initialisiere Secret Manager
const secretsManager = new SecretsManager();

export const config = {
  // GitHub
  github: {
    token:
      process.env.GITHUB_TOKEN ||
      secretsManager.getSecret("GITHUB_TOKEN") ||
      "",
  },

  // Slack
  slack: {
    webhookUrl:
      process.env.SLACK_WEBHOOK_URL ||
      secretsManager.getSecret("SLACK_WEBHOOK_URL") ||
      "",
  },

  // API
  api: {
    baseUrl:
      process.env.API_BASE_URL ||
      secretsManager.getSecret("API_BASE_URL") ||
      "https://api.example.com",
    username:
      process.env.API_USERNAME ||
      secretsManager.getSecret("API_USERNAME") ||
      "",
    password:
      process.env.API_PASSWORD ||
      secretsManager.getSecret("API_PASSWORD") ||
      "",
    apiKey: process.env.API_KEY || secretsManager.getSecret("API_KEY") || "",
  },

  // Mobile
  mobile: {
    testUser:
      process.env.MOBILE_TEST_USER ||
      secretsManager.getSecret("MOBILE_TEST_USER") ||
      "",
    testPassword:
      process.env.MOBILE_TEST_PASSWORD ||
      secretsManager.getSecret("MOBILE_TEST_PASSWORD") ||
      "",
  },

  // Browser
  browser: {
    testUser:
      process.env.BROWSER_TEST_USER ||
      secretsManager.getSecret("BROWSER_TEST_USER") ||
      "",
    testPassword:
      process.env.BROWSER_TEST_PASSWORD ||
      secretsManager.getSecret("BROWSER_TEST_PASSWORD") ||
      "",
  },

  // Database
  database: {
    host:
      process.env.DB_HOST || secretsManager.getSecret("DB_HOST") || "localhost",
    port: parseInt(
      process.env.DB_PORT || secretsManager.getSecret("DB_PORT") || "5432"
    ),
    user: process.env.DB_USER || secretsManager.getSecret("DB_USER") || "",
    password:
      process.env.DB_PASSWORD || secretsManager.getSecret("DB_PASSWORD") || "",
    name:
      process.env.DB_NAME || secretsManager.getSecret("DB_NAME") || "sdet_test",
  },

  // Allure
  allure: {
    resultsDir:
      process.env.ALLURE_RESULTS_DIR || "reports/allure/allure-results",
    reportDir: process.env.ALLURE_REPORT_DIR || "reports/allure/allure-report",
  },

  // Playwright
  playwright: {
    headless: process.env.PLAYWRIGHT_HEADLESS === "true",
    slowMo: parseInt(process.env.PLAYWRIGHT_SLOW_MO || "0"),
    timeout: parseInt(process.env.PLAYWRIGHT_TIMEOUT || "30000"),
  },

  // Environment
  env: process.env.NODE_ENV || "test",
  debug: process.env.DEBUG === "true",
  logLevel: process.env.LOG_LEVEL || "info",

  // Secrets Manager
  secretsManager,
};

export default config;

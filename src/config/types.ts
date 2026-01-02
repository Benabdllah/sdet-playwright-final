export interface IConfig {
  github: {
    token: string;
  };
  slack: {
    webhookUrl: string;
  };
  api: {
    baseUrl: string;
    username: string;
    password: string;
    apiKey: string;
  };
  mobile: {
    testUser: string;
    testPassword: string;
  };
  browser: {
    testUser: string;
    testPassword: string;
  };
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
  };
  allure: {
    resultsDir: string;
    reportDir: string;
  };
  playwright: {
    headless: boolean;
    slowMo: number;
    timeout: number;
  };
  env: string;
  debug: boolean;
  logLevel: string;
}
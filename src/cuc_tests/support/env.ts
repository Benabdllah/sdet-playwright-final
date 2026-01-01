//const dotenv = require('dotenv') as any;
import dotenv from 'dotenv';

import * as path from 'path';
import { BrowserContextOptions, LaunchOptions, ViewportSize } from '@playwright/test';

// ================================
// 1. ENV-LADEN MIT PRIORITÄT
// ================================
// Reihenfolge: .env.local → .env.[env] → .env → fallback defaults
const envFiles = [
  '.env.local',
  `.env.${process.env.NODE_ENV || 'development'}`,
  '.env',
];

envFiles.forEach(file => {
  const envPath = path.resolve(process.cwd(), file);
  dotenv.config({ path: envPath, override: true });
});

// ================================
// 2. TYPE DEFINITIONS
// ================================
export type Environment = 'development' | 'test' | 'staging' | 'production' | 'qa';
export type BrowserType = 'chromium' | 'firefox' | 'webkit';
export type TraceMode = 'off' | 'on' | 'retain-on-failure' | 'on-first-retry';
export type ScreenshotMode = 'off' | 'on' | 'only-on-failure';
export type VideoMode = 'off' | 'on' | 'retain-on-failure' | 'on-first-retry';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';
export type ColorScheme = 'light' | 'dark' | 'no-preference';

export interface Geolocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface EnvironmentConfig {

  CONTEXT_OPTIONS?: BrowserContextOptions;
  launchOptions: LaunchOptions;
  env: Environment;
  nodeEnv: string;
  baseUrl: string;
  apiUrl: string;
  browser: BrowserType;
  headless: boolean;
  slowMo: number;
  timeouts: {
    default: number;
    navigation: number;
    action: number;
    expect: number;
  };
  trace: TraceMode;
  screenshot: ScreenshotMode;
  video: VideoMode;
  locale?: string;
  timezone: string;
  logLevel: LogLevel;
  features: {
    video: any;
    trace: any;
    metrics: boolean;
    performance: boolean;
    accessibility: boolean;
    visualRegression: boolean;
    apiTesting: boolean;
    recordHar: boolean;
  };
  retryDelay: number;
  viewport: ViewportSize;
  geolocation?: Geolocation;
  permissions: string[];
  colorScheme: ColorScheme;
}

// ================================
// 3. HELPER FUNCTIONS
// ================================
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

function parseInt10(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function parseFloat10(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

function getEnvVar<T = string>(key: string, defaultValue?: T): T | string {
  const value = process.env[key];
  if (value === undefined || value === '') {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`❌ Environment variable ${key} is required but not set!`);
  }
  return value as T;
}

function getOptionalEnvVar(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

// ================================
// 4. TYPISIERTE ENV-VARIABLEN
// ================================
export const ENV = (getOptionalEnvVar('NODE_ENV', 'development')) as Environment;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// URLs
export const BASE_URL = getOptionalEnvVar('BASE_URL', 'https://the-internet.herokuapp.com');
export const API_URL = getOptionalEnvVar('API_URL', 'https://api.example.com');
export const WS_URL = getOptionalEnvVar('WS_URL', 'wss://api.example.com');

// Browser Configuration
export const BROWSER = (getOptionalEnvVar('BROWSER', 'chromium')) as BrowserType;
export const HEADLESS = !parseBoolean(process.env.HEADLESS, true) ? false : true;
export const SLOW_MO = parseInt10(process.env.SLOW_MO, 0);
export const DEVTOOLS = parseBoolean(process.env.DEVTOOLS, false);

// Timeouts
export const TIMEOUT = parseInt10(process.env.TIMEOUT, 30000);
export const NAVIGATION_TIMEOUT = parseInt10(process.env.NAVIGATION_TIMEOUT, 60000);
export const ACTION_TIMEOUT = parseInt10(process.env.ACTION_TIMEOUT, 15000);
export const EXPECT_TIMEOUT = parseInt10(process.env.EXPECT_TIMEOUT, 10000);

// Recording & Debugging
export const TRACE = (getOptionalEnvVar('TRACE', 'on-first-retry')) as TraceMode;
export const SCREENSHOT = (getOptionalEnvVar('SCREENSHOT', 'only-on-failure')) as ScreenshotMode;
export const VIDEO = (getOptionalEnvVar('VIDEO', 'retain-on-failure')) as VideoMode;
export const RECORD_HAR = parseBoolean(process.env.RECORD_HAR, false);

// Localization
export const LOCALE = getOptionalEnvVar('LOCALE', 'de-DE');
export const TIMEZONE = getOptionalEnvVar('TIMEZONE', 'Europe/Berlin');
export const COLOR_SCHEME = (getOptionalEnvVar('COLOR_SCHEME', 'light')) as ColorScheme;

// Logging
export const LOG_LEVEL = (getOptionalEnvVar('LOG_LEVEL', 'info')) as LogLevel;
export const VERBOSE = parseBoolean(process.env.VERBOSE, false);

// Feature Flags
export const ENABLE_METRICS = parseBoolean(process.env.ENABLE_METRICS, true);
export const ENABLE_PERFORMANCE = parseBoolean(process.env.ENABLE_PERFORMANCE, true);
export const ENABLE_ACCESSIBILITY = parseBoolean(process.env.ENABLE_ACCESSIBILITY, false);
export const ENABLE_VISUAL_REGRESSION = parseBoolean(process.env.ENABLE_VISUAL_REGRESSION, false);
export const ENABLE_API_TESTING = parseBoolean(process.env.ENABLE_API_TESTING, true);

// Retry Configuration
export const RETRY_DELAY = parseInt10(process.env.RETRY_DELAY, 1000);
export const MAX_RETRIES = parseInt10(process.env.MAX_RETRIES, 2);

// CI/CD Configuration
export const CI = parseBoolean(process.env.CI, false);
export const CI_NODE_INDEX = parseInt10(process.env.CI_NODE_INDEX, 0);
export const CI_NODE_TOTAL = parseInt10(process.env.CI_NODE_TOTAL, 1);
export const SHARD_INDEX = parseInt10(process.env.SHARD_INDEX, 0);
export const SHARD_TOTAL = parseInt10(process.env.SHARD_TOTAL, 1);

// ================================
// 5. VIEWPORT CONFIGURATION
// ================================
export const VIEWPORT: ViewportSize = {
  width: parseInt10(process.env.VIEWPORT_WIDTH, 1280),
  height: parseInt10(process.env.VIEWPORT_HEIGHT, 720),
};

// Predefined Viewports
export const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  laptop: { width: 1366, height: 768 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
  iphone12: { width: 390, height: 844 },
  ipad: { width: 820, height: 1180 },
} as const;

// ================================
// 6. GEOLOCATION & PERMISSIONS
// ================================
export const GEOLOCATION: Geolocation | undefined = process.env.GEOLOCATION_ENABLED === 'true'
  ? {
      latitude: parseFloat10(process.env.GEOLOCATION_LAT, 50.7374),
      longitude: parseFloat10(process.env.GEOLOCATION_LNG, 7.0982),
      accuracy: parseFloat10(process.env.GEOLOCATION_ACCURACY, 100),
    }
  : undefined;

export const PERMISSIONS = process.env.PERMISSIONS
  ? process.env.PERMISSIONS.split(',').map(p => p.trim())
  : ['geolocation', 'notifications'];

// ================================
// 7. DEVICE CONFIGURATION
// ================================
export const IS_MOBILE = parseBoolean(process.env.IS_MOBILE, false);
export const HAS_TOUCH = parseBoolean(process.env.HAS_TOUCH, IS_MOBILE);
export const DEVICE_SCALE_FACTOR = parseFloat10(process.env.DEVICE_SCALE_FACTOR, 1);
export const USER_AGENT = getOptionalEnvVar('USER_AGENT', '');

// ================================
// 8. LAUNCH OPTIONS
// ================================
export const LAUNCH_OPTIONS: LaunchOptions = {
  headless: HEADLESS,
  slowMo: SLOW_MO,
  devtools: DEVTOOLS,
  timeout: NAVIGATION_TIMEOUT,
  args: [
    '--disable-dev-shm-usage',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-sync',
    '--metrics-recording-only',
    '--no-first-run',
    '--disable-features=IsolateOrigins,site-per-process',
    '--disable-web-security',
    '--allow-running-insecure-content',
    ...(CI ? [
      '--single-process',
      '--no-zygote',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
    ] : []),
  ],
  chromiumSandbox: !CI,
};

// ================================
// 9. CONTEXT OPTIONS
// ================================
export const CONTEXT_OPTIONS: BrowserContextOptions = {
  viewport: VIEWPORT,
  locale: LOCALE,
  timezoneId: TIMEZONE,
  geolocation: GEOLOCATION,
  permissions: PERMISSIONS as any[],
  colorScheme: COLOR_SCHEME,
  acceptDownloads: true,
  ignoreHTTPSErrors: true,
  bypassCSP: parseBoolean(process.env.BYPASS_CSP, false),
  javaScriptEnabled: parseBoolean(process.env.JAVASCRIPT_ENABLED, true),
  hasTouch: HAS_TOUCH,
  isMobile: IS_MOBILE,
  deviceScaleFactor: DEVICE_SCALE_FACTOR,
  userAgent: USER_AGENT || undefined,
  recordHar: RECORD_HAR ? {
    path: `test-results/har/${Date.now()}.har`,
    mode: 'minimal',
  } as any : undefined,
  recordVideo: VIDEO !== 'off' ? {
    dir: 'test-results/videos',
    size: VIEWPORT,
  } : undefined,
};

// ================================
// 10. AUTHENTICATION
// ================================
export const AUTH = {
  enabled: parseBoolean(process.env.AUTH_ENABLED, false),
  username: getOptionalEnvVar('AUTH_USERNAME', ''),
  password: getOptionalEnvVar('AUTH_PASSWORD', ''),
  token: getOptionalEnvVar('AUTH_TOKEN', ''),
  apiKey: getOptionalEnvVar('API_KEY', ''),
};

// ================================
// 11. DATABASE (optional)
// ================================
export const DATABASE = {
  enabled: parseBoolean(process.env.DB_ENABLED, false),
  host: getOptionalEnvVar('DB_HOST', 'localhost'),
  port: parseInt10(process.env.DB_PORT, 5432),
  name: getOptionalEnvVar('DB_NAME', 'test_db'),
  user: getOptionalEnvVar('DB_USER', 'test_user'),
  password: getOptionalEnvVar('DB_PASSWORD', ''),
};

// ================================
// 12. REPORTING
// ================================
export const REPORTING = {
  outputDir: getOptionalEnvVar('REPORT_OUTPUT_DIR', 'test-results'),
  screenshotDir: getOptionalEnvVar('SCREENSHOT_DIR', 'test-results/screenshots'),
  videoDir: getOptionalEnvVar('VIDEO_DIR', 'test-results/videos'),
  traceDir: getOptionalEnvVar('TRACE_DIR', 'test-results/traces'),
  harDir: getOptionalEnvVar('HAR_DIR', 'test-results/har'),
  generateHtml: parseBoolean(process.env.GENERATE_HTML_REPORT, true),
  generateJson: parseBoolean(process.env.GENERATE_JSON_REPORT, true),
  generateJunit: parseBoolean(process.env.GENERATE_JUNIT_REPORT, true),
  openReport: parseBoolean(process.env.OPEN_REPORT, false),
};

// ================================
// 13. FULL CONFIG EXPORT
// ================================
export const CONFIG: EnvironmentConfig = {
  env: ENV,
  nodeEnv: NODE_ENV,
  baseUrl: BASE_URL,
  apiUrl: API_URL,
  browser: BROWSER,
  headless: HEADLESS,
  slowMo: SLOW_MO,
  timeouts: {
    default: TIMEOUT,
    navigation: NAVIGATION_TIMEOUT,
    action: ACTION_TIMEOUT,
    expect: EXPECT_TIMEOUT,
  },
   CONTEXT_OPTIONS: {
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    locale: 'de-DE',
  },
  
  launchOptions: {
    headless: true,
    slowMo: 0
  },
  trace: TRACE,
  screenshot: SCREENSHOT,
  video: VIDEO,
  locale: LOCALE,
  timezone: TIMEZONE,
  logLevel: LOG_LEVEL,
  features: {
    video: VIDEO,
    trace: TRACE,
    metrics: ENABLE_METRICS,
    performance: ENABLE_PERFORMANCE,
    accessibility: ENABLE_ACCESSIBILITY,
    visualRegression: ENABLE_VISUAL_REGRESSION,
    apiTesting: ENABLE_API_TESTING,
    recordHar: RECORD_HAR,
  },
  retryDelay: RETRY_DELAY,
  viewport: VIEWPORT,
  geolocation: GEOLOCATION,
  permissions: PERMISSIONS,
  colorScheme: COLOR_SCHEME,
};

// ================================
// 14. VALIDATION
// ================================
function validateEnvironment(): void {
  const errors: string[] = [];

  // Validate URLs
  if (ENV === 'production' || ENV === 'staging') {
    if (!BASE_URL.startsWith('http')) {
      errors.push('BASE_URL must be a valid URL');
    }
    if (!API_URL.startsWith('http')) {
      errors.push('API_URL must be a valid URL');
    }
  }

  // Validate timeouts
  if (TIMEOUT < 1000 || TIMEOUT > 300000) {
    errors.push('TIMEOUT must be between 1000 and 300000ms');
  }

  // Validate viewport
  if (VIEWPORT.width < 320 || VIEWPORT.height < 240) {
    errors.push('VIEWPORT dimensions too small (min 320x240)');
  }

  // Validate CI shard configuration
  if (SHARD_INDEX >= SHARD_TOTAL) {
    errors.push('SHARD_INDEX must be less than SHARD_TOTAL');
  }

  if (errors.length > 0) {
    console.error('❌ Environment validation failed:');
    errors.forEach(err => console.error(`   - ${err}`));
    if (CI) {
      process.exit(1);
    }
  }
}

// Run validation
validateEnvironment();

// ================================
// 15. ENVIRONMENT-SPECIFIC WARNINGS
// ================================
if (ENV === 'production' || ENV === 'staging') {
  const requiredVars = ['BASE_URL', 'API_URL'];
  requiredVars.forEach(key => {
    if (!process.env[key]) {
      console.warn(`⚠️  ${key} not explicitly set in ${ENV} environment – using default`);
    }
  });

  if (!HEADLESS) {
    console.warn(`⚠️  Running in HEADED mode in ${ENV} – this should be avoided in CI/CD`);
  }
}

// ================================
// 16. DEBUG LOGGING
// ================================
if (LOG_LEVEL === 'debug' || VERBOSE || ENV === 'development') {
  console.log('\n🚀 ========================================');
  console.log('   SDET+++++ Environment Configuration');
  console.log('========================================\n');
  
  console.table({
    Environment: ENV,
    'Node Env': NODE_ENV,
    'Base URL': BASE_URL,
    'API URL': API_URL,
    Browser: BROWSER,
    Headless: HEADLESS,
    'Slow Mo': SLOW_MO,
    Timeout: TIMEOUT,
    Trace: TRACE,
    Screenshot: SCREENSHOT,
    Video: VIDEO,
    Locale: LOCALE,
    Timezone: TIMEZONE,
    'CI Mode': CI,
  });

  console.log('\n📊 Feature Flags:');
  console.table({
    Metrics: ENABLE_METRICS,
    Performance: ENABLE_PERFORMANCE,
    Accessibility: ENABLE_ACCESSIBILITY,
    'Visual Regression': ENABLE_VISUAL_REGRESSION,
    'API Testing': ENABLE_API_TESTING,
    'Record HAR': RECORD_HAR,
  });

  if (CI) {
    console.log('\n🔄 CI Configuration:');
    console.table({
      'Node Index': CI_NODE_INDEX,
      'Node Total': CI_NODE_TOTAL,
      'Shard Index': SHARD_INDEX,
      'Shard Total': SHARD_TOTAL,
    });
  }

  console.log('\n========================================\n');
}

// ================================
// 17. UTILITY EXPORTS
// ================================
export { getEnvVar, getOptionalEnvVar, parseBoolean, parseInt10, parseFloat10 };

export function isProduction(): boolean {
  return ENV === 'production';
}

export function isDevelopment(): boolean {
  return ENV === 'development';
}

export function isTest(): boolean {
  return ENV === 'test';
}

export function isCI(): boolean {
  return CI;
}

export function shouldRecordVideo(): boolean {
  return VIDEO !== 'off';
}

export function shouldTakeScreenshots(): boolean {
  return SCREENSHOT !== 'off';
}

export function shouldTraceTests(): boolean {
  return TRACE !== 'off';
}

// ================================
// 18. EXPORT DEFAULT CONFIG
// ================================
export default CONFIG;
/**
 * ============================================================================
 * JEST SETUP FILE - setupFilesAfterEnv
 * ============================================================================
 * Runs after Jest environment is set up
 * Configure test timeout, global mocks, and test utilities
 */

import dotenv from 'dotenv';
import path from 'node:path';
import { beforeEach, afterEach, afterAll, jest as jestGlobal } from '@jest/globals';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// ============================================================================
// GLOBAL TEST CONFIGURATION
// ============================================================================

/** Set default test timeout */
jestGlobal.setTimeout(30000);

/** Suppress console warnings in tests (optional) */
globalThis.console = {
  ...console,
  debug: jestGlobal.fn(),
  log: jestGlobal.fn(),
  info: jestGlobal.fn(),
  warn: jestGlobal.fn(),
  error: jestGlobal.fn(),
};

/** Restore console for specific test output */
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

globalThis.testLog = {
  log: originalLog,
  error: originalError,
  warn: originalWarn,
};

// ============================================================================
// GLOBAL TEST UTILITIES
// ============================================================================

/** Global test helpers */
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUrl(): R;
      toBeValidEmail(): R;
      toContainObject(expected: Record<string, any>): R;
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }

  var testLog: {
    log: typeof console.log;
    error: typeof console.error;
    warn: typeof console.warn;
  };

  var testConfig: {
    baseUrl: string;
    apiUrl: string;
    timeout: number;
    CI: boolean;
  };
}

// Global test config
globalThis.testConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:3001/api',
  timeout: Number.parseInt(process.env.TEST_TIMEOUT || '30000', 10),
  CI: !!process.env.CI,
};

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

let testStartTime: number;

beforeEach(() => {
  testStartTime = performance.now();
});

afterEach(() => {
  const testEndTime = performance.now();
  const duration = testEndTime - testStartTime;

  if (duration > 5000) {
    globalThis.testLog.warn(`⚠️  Test took ${duration.toFixed(2)}ms (slow)`);
  }
});

// ============================================================================
// FETCH MOCK
// ============================================================================

/** Mock fetch if not available */
if (!globalThis.fetch) {
  const fetch = require('node-fetch');
  globalThis.fetch = fetch;
}

// ============================================================================
// ABORT CONTROLLER MOCK
// ============================================================================

if (!globalThis.AbortController) {
  globalThis.AbortController = class AbortController {
    signal = new AbortSignal();
    abort() {
      this.signal.dispatchEvent(new Event('abort'));
    }
  } as any;
}

if (!globalThis.AbortSignal) {
  globalThis.AbortSignal = EventTarget as any;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/** Handle unhandled promise rejections */
process.on('unhandledRejection', (reason, promise) => {
  globalThis.testLog.error(`❌ Unhandled Rejection, reason:`, reason);
});

/** Handle uncaught exceptions */
process.on('uncaughtException', (error) => {
  globalThis.testLog.error(`❌ Uncaught Exception: ${error.message}`, error);
});

// ============================================================================
// TEST TIMEOUT HANDLING
// ============================================================================

/** Warning for slow tests */
const slowTestWarningTime = 10000; // 10 seconds

let currentTestName: string;

beforeEach(function (this: any) {
  currentTestName = this.currentTestName;
});

afterEach(function (this: any) {
  if (this.currentTestName && currentTestName === this.currentTestName) {
    // Test completed successfully
  }
});

// ============================================================================
// GLOBAL TEARDOWN
// ============================================================================

afterAll(async () => {
  // Clean up any global resources
  jestGlobal.clearAllMocks();
  jestGlobal.restoreAllMocks();
});

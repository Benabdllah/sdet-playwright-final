/**
 * ============================================================================
 * JEST SETUP FILE - setupFilesAfterEnv
 * ============================================================================
 * Runs after Jest environment is set up
 * Configure test timeout, global mocks, and test utilities
 */

import dotenv from 'dotenv';
import path from 'path';
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
global.console = {
  ...console,
  debug: jest.fn(),
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

/** Restore console for specific test output */
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

global.testLog = {
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
global.testConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:3001/api',
  timeout: parseInt(process.env.TEST_TIMEOUT || '30000', 10),
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
    global.testLog.warn(`⚠️  Test took ${duration.toFixed(2)}ms (slow)`);
  }
});

// ============================================================================
// FETCH MOCK
// ============================================================================

/** Mock fetch if not available */
if (!global.fetch) {
  const fetch = require('node-fetch');
  global.fetch = fetch;
}

// ============================================================================
// ABORT CONTROLLER MOCK
// ============================================================================

if (!global.AbortController) {
  global.AbortController = class AbortController {
    signal = new AbortSignal();
    abort() {
      this.signal.dispatchEvent(new Event('abort'));
    }
  } as any;
}

if (!global.AbortSignal) {
  global.AbortSignal = EventTarget as any;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/** Handle unhandled promise rejections */
process.on('unhandledRejection', (reason, promise) => {
  global.testLog.error(`❌ Unhandled Rejection at: ${promise}, reason:`, reason);
});

/** Handle uncaught exceptions */
process.on('uncaughtException', (error) => {
  global.testLog.error(`❌ Uncaught Exception: ${error.message}`, error);
});

// ============================================================================
// TEST TIMEOUT HANDLING
// ============================================================================

/** Warning for slow tests */
const slowTestWarningTime = 10000; // 10 seconds

let currentTestName: string;

beforeEach(function (this) {
  currentTestName = this.currentTestName;
});

afterEach(function (this) {
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

export {};

/**
 * ============================================================================
 * JEST ENVIRONMENT SETUP - setupFiles
 * ============================================================================
 * Runs before Jest environment is initialized
 * Set up environment variables and global constants
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// ============================================================================
// ENVIRONMENT VARIABLES LOADING
// ============================================================================

/** Load environment files in order of precedence */
const envFiles = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../.env.test'),
  path.resolve(__dirname, '../../.env.test.local'),
];

envFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    dotenv.config({ path: file, override: true });
  }
});

// ============================================================================
// DEFAULT ENVIRONMENT VARIABLES
// ============================================================================

/** Set default environment variables if not already set */
const defaults = {
  NODE_ENV: 'test',
  BASE_URL: 'http://localhost:3000',
  API_URL: 'http://localhost:3001/api',
  TEST_TIMEOUT: '30000',
  DEBUG: 'false',
  LOG_LEVEL: 'info',
  HEADLESS: 'true',
  BROWSER: 'chromium',
  WORKERS: '1',
};

Object.entries(defaults).forEach(([key, value]) => {
  if (!process.env[key]) {
    process.env[key] = value;
  }
});

// ============================================================================
// GLOBAL NODE CONFIGURATION
// ============================================================================

/** Increase max listeners to prevent warnings */
process.setMaxListeners(20);

/** Set up process flags */
process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || '') + ' --max-old-space-size=4096';

// ============================================================================
// TIMEZONE CONFIGURATION
// ============================================================================

/** Set consistent timezone for tests */
process.env.TZ = 'UTC';

// ============================================================================
// REQUIRE STACK DEPTH
// ============================================================================

/** Increase require stack depth to prevent circular dependency issues */
if (!('--stack-trace-limit' in process.env)) {
  process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || '') + ' --stack-trace-limit=50';
}

// ============================================================================
// LOG CONFIGURATION
// ============================================================================

console.log('🧪 Jest Test Environment Initialized');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   BASE_URL: ${process.env.BASE_URL}`);
console.log(`   API_URL: ${process.env.API_URL}`);
console.log(`   TEST_TIMEOUT: ${process.env.TEST_TIMEOUT}ms`);
console.log(`   HEADLESS: ${process.env.HEADLESS}`);
console.log(`   BROWSER: ${process.env.BROWSER}`);
console.log(`   WORKERS: ${process.env.WORKERS}`);
console.log(`   CI: ${process.env.CI ? 'true' : 'false'}`);

/**
 * ============================================================================
 * JEST GLOBAL SETUP
 * ============================================================================
 * Runs once before all test suites
 * Initialize databases, servers, or other global resources
 */

import path from "path";
import fs from "fs";

/** Global setup function */
export default async function globalSetup() {
  console.log("\n🚀 JEST GLOBAL SETUP - Initializing test environment...\n");

  try {
    // ======================================================================
    // CREATE REQUIRED DIRECTORIES
    // ======================================================================

    const requiredDirs = [
      path.resolve(__dirname, "../../test-results"),
      path.resolve(__dirname, "../../test-results/junit"),
      path.resolve(__dirname, "../../test-results/jest-html"),
      path.resolve(__dirname, "../../test-results/coverage"),
      path.resolve(__dirname, "../../test-results/logs"),
      path.resolve(__dirname, "../../test-results/metrics"),
      path.resolve(__dirname, "../../allure-results"),
      path.resolve(__dirname, "../../playwright-report"),
    ];

    requiredDirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      }
    });

    // ======================================================================
    // CLEAN UP OLD TEST ARTIFACTS
    // ======================================================================

    const cleanup = (dir: string) => {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        fs.mkdirSync(dir, { recursive: true });
        console.log(`🧹 Cleaned up: ${dir}`);
      }
    };

    // NOTE: Cleanup paused to protect test-results structure
    // To enable: change CLEAN_UP_ENABLED to 'true'
    const CLEAN_UP_ENABLED = false;
    if (process.env.CLEAN_UP === "true" && CLEAN_UP_ENABLED) {
      cleanup(path.resolve(__dirname, "../../allure-results"));
      cleanup(path.resolve(__dirname, "../../reports/html-report"));
    }

    // ======================================================================
    // VERIFY ENVIRONMENT
    // ======================================================================

    console.log("\n📋 Environment Configuration:");
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   BASE_URL: ${process.env.BASE_URL}`);
    console.log(`   API_URL: ${process.env.API_URL}`);
    console.log(`   TEST_TIMEOUT: ${process.env.TEST_TIMEOUT}ms`);
    console.log(`   CI: ${process.env.CI ? "true" : "false"}`);
    console.log(`   DEBUG: ${process.env.DEBUG}`);

    // ======================================================================
    // START GLOBAL RESOURCES (if needed)
    // ======================================================================

    if (process.env.START_SERVER === "true") {
      console.log("\n🌍 Starting test server...");
      // Add server startup logic here
    }

    if (process.env.START_DATABASE === "true") {
      console.log("\n💾 Initializing test database...");
      // Add database initialization logic here
    }

    // ======================================================================
    // SETUP GLOBAL VARIABLES
    // ======================================================================

    (global as any).TEST_START_TIME = Date.now();
    (global as any).TEST_RESULTS = {
      passed: 0,
      failed: 0,
      skipped: 0,
    };

    console.log("\n✨ Global setup completed successfully!\n");

    return Promise.resolve();
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error;
  }
}

/**
 * ============================================================================
 * JEST GLOBAL TEARDOWN
 * ============================================================================
 * Runs once after all test suites complete
 * Clean up global resources and generate reports
 */

import path from 'path';
import fs from 'fs';

/** Global teardown function */
export default async function globalTeardown() {
  console.log('\n🛑 JEST GLOBAL TEARDOWN - Cleaning up test environment...\n');

  try {
    // ======================================================================
    // CALCULATE TEST DURATION
    // ======================================================================

    const startTime = (global as any).TEST_START_TIME || Date.now();
    const endTime = Date.now();
    const duration = endTime - startTime;
    const durationSeconds = (duration / 1000).toFixed(2);

    // ======================================================================
    // GENERATE SUMMARY REPORT
    // ======================================================================

    const testResults = (global as any).TEST_RESULTS || {
      passed: 0,
      failed: 0,
      skipped: 0,
    };

    const summaryReport = {
      timestamp: new Date().toISOString(),
      duration: `${durationSeconds}s`,
      totalTests: testResults.passed + testResults.failed + testResults.skipped,
      passed: testResults.passed,
      failed: testResults.failed,
      skipped: testResults.skipped,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nodeVersion: process.version,
        baseUrl: process.env.BASE_URL,
        apiUrl: process.env.API_URL,
        ci: !!process.env.CI,
      },
    };

    const summaryPath = path.resolve(
      __dirname,
      '../../test-results/summary.json'
    );
    fs.writeFileSync(summaryPath, JSON.stringify(summaryReport, null, 2));
    console.log(`✅ Summary report saved: ${summaryPath}`);

    // ======================================================================
    // VERIFY TEST ARTIFACTS
    // ======================================================================

    console.log('\n📊 Test Results Summary:');
    console.log(`   Total Duration: ${durationSeconds}s`);
    console.log(`   Total Tests: ${summaryReport.totalTests}`);
    console.log(`   ✅ Passed: ${testResults.passed}`);
    console.log(`   ❌ Failed: ${testResults.failed}`);
    console.log(`   ⏭️  Skipped: ${testResults.skipped}`);

    // ======================================================================
    // CLEANUP RESOURCES
    // ======================================================================

    if (process.env.CLEAN_UP_AFTER === 'true') {
      console.log('\n🧹 Cleaning up temporary files...');
      const tempDirs = [
        path.resolve(__dirname, '../../.jest-cache'),
      ];

      tempDirs.forEach((dir) => {
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
          console.log(`   Removed: ${dir}`);
        }
      });
    }

    // ======================================================================
    // STOP GLOBAL RESOURCES
    // ======================================================================

    if (process.env.STOP_SERVER === 'true') {
      console.log('\n🛑 Stopping test server...');
      // Add server stop logic here
    }

    if (process.env.STOP_DATABASE === 'true') {
      console.log('\n💾 Closing test database...');
      // Add database cleanup logic here
    }

    // ======================================================================
    // ARCHIVE LOGS IF NEEDED
    // ======================================================================

    if (process.env.ARCHIVE_LOGS === 'true') {
      console.log('\n📦 Archiving test logs...');
      const logsDir = path.resolve(__dirname, '../../test-results/logs');
      const archiveDir = path.resolve(__dirname, '../../test-results/logs/archive');

      if (fs.existsSync(logsDir)) {
        if (!fs.existsSync(archiveDir)) {
          fs.mkdirSync(archiveDir, { recursive: true });
        }
        console.log(`   Logs archived to: ${archiveDir}`);
      }
    }

    // ======================================================================
    // GENERATE METRICS
    // ======================================================================

    const metricsPath = path.resolve(
      __dirname,
      `../../metrics/metrics-${Date.now()}.json`
    );

    const metricsDir = path.dirname(metricsPath);
    if (!fs.existsSync(metricsDir)) {
      fs.mkdirSync(metricsDir, { recursive: true });
    }

    const metrics = {
      timestamp: new Date().toISOString(),
      duration: duration,
      durationSeconds: parseFloat(durationSeconds),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
    };

    fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
    console.log(`✅ Metrics saved: ${metricsPath}`);

    // ======================================================================
    // FINAL MESSAGE
    // ======================================================================

    console.log('\n✨ Global teardown completed successfully!');
    console.log(
      `📝 Check ${summaryPath} for detailed test summary\n`
    );

    return Promise.resolve();
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    throw error;
  }
}

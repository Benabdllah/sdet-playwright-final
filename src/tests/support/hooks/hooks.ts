import { BeforeAll, AfterAll, Before, After, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, firefox, webkit, Browser, BrowserContext, Page } from '@playwright/test';
import { CustomWorld } from './world';
import { CONFIG } from './env';
import { promises as fs } from 'fs';
import * as path from 'path';

// Type-safe Status inkl. UNKNOWN
type StatusValue = typeof Status[keyof typeof Status] | 'UNKNOWN';

const STATUS_LABELS: Record<StatusValue, string> = {
  UNKNOWN: 'UNKNOWN',
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  SKIPPED: 'SKIPPED',
  PENDING: 'PENDING',
  UNDEFINED: 'UNDEFINED',
  AMBIGUOUS: 'AMBIGUOUS',
};

// Default Timeout
setDefaultTimeout(CONFIG.timeouts?.default ?? 60000);

let browser: Browser;

/**
 * 🚀 BEFORE ALL - Global Setup
 */
BeforeAll(async () => {
  console.log('\n🔧 ========================================');
  console.log('🔧 GLOBAL TEST SETUP STARTED');
  console.log('🔧 ========================================\n');

  // Ensure directories
  const dirs = ['screenshots', 'videos', 'traces', 'reports', 'metrics', 'logs', 'downloads'];
  console.log(`📁 Creating ${dirs.length} output directories...`);
  for (const dir of dirs) {
    await fs.mkdir(path.resolve(dir), { recursive: true });
    console.log(`   ✅ ${dir}`);
  }

  // Launch Browser
  console.log('\n🌐 Launching browser...');
  const launchOptions = { ...CONFIG.launchOptions, timeout: 30000 };
  const browserType = CONFIG.browser.toLowerCase();
  
  switch (browserType) {
    case 'chromium': browser = await chromium.launch(launchOptions); break;
    case 'firefox': browser = await firefox.launch(launchOptions); break;
    case 'webkit': browser = await webkit.launch(launchOptions); break;
    default: browser = await chromium.launch(launchOptions); break;
  }

  console.log(`✅ Browser launched: ${CONFIG.browser.toUpperCase()}`);
  console.log(`   Headless: ${CONFIG.launchOptions?.headless ? 'Yes' : 'No'}`);
  console.log(`   SlowMo: ${CONFIG.launchOptions?.slowMo ?? 0}ms`);
  console.log(`   Timeout: 30000ms`);

  // Log enabled features
  console.log('\n🎯 Features enabled:');
  console.log(`   Video Recording: ${CONFIG.features.video ? '✅' : '❌'}`);
  console.log(`   Tracing: ${CONFIG.features.trace ? '✅' : '❌'}`);
  console.log(`   Metrics: ${CONFIG.features.metrics ? '✅' : '❌'}`);
  console.log(`   Accessibility: ${CONFIG.features.accessibility ? '✅' : '❌'}`);
  console.log(`   Visual Regression: ${CONFIG.features.visualRegression ? '✅' : '❌'}`);

  console.log('\n🔧 ========================================\n');
});

/**
 * 🎬 BEFORE - Scenario Setup
 */
Before(async function (this: CustomWorld, { pickle, gherkinDocument }) {
  this.scenarioName = pickle.name;
  this.featureName = gherkinDocument.feature?.name ?? 'Unknown';
  this.startTime = Date.now();

  const tags = pickle.tags.map(t => t.name).join(', ') || 'none';

  console.log('\n▶️  ========================================');
  console.log(`▶️  SCENARIO: ${this.scenarioName}`);
  console.log(`   Feature: ${this.featureName}`);
  console.log(`   Tags: ${tags}`);
  console.log('▶️  ========================================\n');

  try {
    // Video recording per scenario
    const recordVideo = CONFIG.features.video ? { dir: 'videos' } : undefined;

    // Create context & page
    console.log('📄 Creating new browser context...');
    this.context = await browser.newContext({ ...CONFIG.CONTEXT_OPTIONS, recordVideo });
    this.page = await this.context.newPage();
    console.log(`✅ Browser context created`);
    
    if (recordVideo) {
      console.log(`🎥 Video recording enabled`);
    }

    // Start tracing if enabled
    if (CONFIG.features.trace) {
      console.log('🔍 Starting trace collection...');
      await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true });
      console.log('✅ Tracing started');
    }

    // Performance timing
    if (CONFIG.features.metrics && this.page) {
      console.log('📊 Setting up performance monitoring...');
      await this.page.evaluate(() => { (window as any).testStartTime = performance.now(); });
      console.log('✅ Performance monitoring ready');
    }

    console.log('✅ Scenario ready to execute\n');
  } catch (err) {
    console.error('❌ Failed to initialize scenario page/context:', err);
    throw err;
  }
});

/**
 * 📸 AFTER - Scenario Teardown
 */
After(async function (this: CustomWorld, { result, pickle }) {
  const duration = Date.now() - (this.startTime ?? Date.now());
  const status: StatusValue = (result?.status as StatusValue) ?? 'UNKNOWN';
  const scenarioName = pickle.name;
  const statusEmoji = getStatusEmoji(status);

  console.log('\n🏁 ========================================');
  console.log(`🏁 SCENARIO COMPLETED: ${scenarioName}`);
  console.log(`   Status: ${statusEmoji} ${STATUS_LABELS[status]}`);
  console.log(`   Duration: ${(duration / 1000).toFixed(2)}s`);
  console.log('🏁 ========================================\n');

  try {
    // Capture artifacts on failure
    if (status === 'FAILED' && this.page) {
      console.log('📸 Capturing failure artifacts...');
      
      // Screenshot
      try {
        const screenshotPath = path.join('screenshots', `${sanitizeFilename(scenarioName)}_${Date.now()}.png`);
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        await this.attach(await fs.readFile(screenshotPath), 'image/png');
        console.log(`   ✅ Screenshot saved: ${screenshotPath}`);
      } catch (err) {
        console.error('   ❌ Failed to save screenshot:', err);
      }

      // HTML snapshot
      try {
        await this.attach(await this.page.content(), 'text/html');
        console.log('   ✅ HTML snapshot attached');
      } catch (err) {
        console.error('   ❌ Failed to attach HTML:', err);
      }

      // Console logs
      if (this.logs?.length) {
        try {
          await this.attach(this.logs.join('\n'), 'text/plain');
          console.log(`   ✅ Console logs attached (${this.logs.length} entries)`);
        } catch (err) {
          console.error('   ❌ Failed to attach console logs:', err);
        }
      }

      // Error message
      if (result?.message) {
        try {
          await this.attach(`Error: ${result.message}`, 'text/plain');
          console.log('   ✅ Error details attached');
        } catch (err) {
          console.error('   ❌ Failed to attach error details:', err);
        }
      }
    }

    // Stop tracing
    if (CONFIG.features.trace && this.context) {
      try {
        console.log('🔍 Saving trace...');
        const tracePath = path.join('traces', `${sanitizeFilename(scenarioName)}_${Date.now()}.zip`);
        await this.context.tracing.stop({ path: tracePath });
        console.log(`✅ Trace saved: ${tracePath}`);
      } catch (err) {
        console.error('❌ Failed to save trace:', err);
      }
    }

  if (CONFIG.features.video && this.page) {
  try {
    console.log('🎥 Saving video recording...');

    const video = this.page.video();

    // Page MUSS geschlossen werden, damit Video finalisiert wird
    await this.page.close();

    if (video) {
      const videoPath = path.join(
        'videos',
        `${sanitizeFilename(scenarioName)}_${Date.now()}.webm`
      );

      await video.saveAs(videoPath);
      console.log(`   ✅ Video saved: ${videoPath}`);
    } else {
      console.log('   ⚠️  No video available');
    }
  } catch (err) {
    console.error('❌ Failed to save video:', err);
  }
}

    // Metrics
    if (CONFIG.features.metrics && this.page) {
      try {
        console.log('📊 Collecting performance metrics...');
        const metrics = await this.page.evaluate(() => {
          const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          return {
            domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
            loadComplete: perf.loadEventEnd - perf.loadEventStart,
            responseTime: perf.responseEnd - perf.requestStart,
            domInteractive: perf.domInteractive - perf.fetchStart
          };
        });

        const metricsPath = path.join('metrics', `${sanitizeFilename(scenarioName)}_${Date.now()}.json`);
        await fs.writeFile(metricsPath, JSON.stringify({
          scenario: scenarioName,
          status: STATUS_LABELS[status],
          duration,
          timestamp: new Date().toISOString(),
          performance: metrics
        }, null, 2));
        
        console.log(`✅ Metrics saved: ${metricsPath}`);
        console.log(`   DOM Content Loaded: ${metrics.domContentLoaded.toFixed(2)}ms`);
        console.log(`   Page Load Complete: ${metrics.loadComplete.toFixed(2)}ms`);
        console.log(`   Response Time: ${metrics.responseTime.toFixed(2)}ms`);
        console.log(`   DOM Interactive: ${metrics.domInteractive.toFixed(2)}ms`);
      } catch (err) {
        console.error('❌ Failed to collect metrics:', err);
      }
    }

    // Accessibility placeholder
    if (status === 'FAILED' && CONFIG.features.accessibility) {
      console.log('♿ Accessibility scan placeholder...');
      // TODO: axe-core integration
    }

  } catch (err) {
    console.error('❌ Error in AFTER hook:', err);
  } finally {
  console.log('\n🧹 Cleaning up resources...');
  try {
    // ❗ Page wurde evtl. schon für Video geschlossen
    if (this.page && !this.page.isClosed()) {
      await this.page.close();
    }

    // ✅ Context IMMER GANZ AM ENDE
    await this.context?.close();

    console.log('✅ Context closed successfully\n');
  } catch (err) {
    console.error('❌ Failed to close context:', err);
  }
}

});

/**
 * 🛑 AFTER ALL - Global Teardown
 */
AfterAll(async () => {
  console.log('\n🔧 ========================================');
  console.log('🔧 GLOBAL TEST TEARDOWN STARTED');
  console.log('🔧 ========================================\n');

  console.log('🌐 Closing browser...');
  try {
    await browser?.close();
    console.log('✅ Browser closed successfully');
  } catch (err) {
    console.error('❌ Failed to close browser:', err);
  }

  console.log('\n📊 Generating test summary...');
  await generateTestSummary();

  console.log('\n🔧 ========================================');
  console.log('🏁 ALL TESTS COMPLETED');
  console.log('🔧 ========================================\n');
});

/**
 * 📊 Helper: Generate Test Summary
 */
async function generateTestSummary(): Promise<void> {
  try {
    const summaryPath = path.join('reports', `summary_${Date.now()}.txt`);
    const summary = `
TEST EXECUTION SUMMARY
=====================
Timestamp: ${new Date().toISOString()}
Browser: ${CONFIG.browser}
Environment: ${CONFIG.env}
Headless: ${CONFIG.launchOptions?.headless ?? false}

Features Enabled:
- Video Recording: ${CONFIG.features.video ? '✅' : '❌'}
- Tracing: ${CONFIG.features.trace ? '✅' : '❌'}
- Metrics: ${CONFIG.features.metrics ? '✅' : '❌'}
- Accessibility: ${CONFIG.features.accessibility ? '✅' : '❌'}
- Visual Regression: ${CONFIG.features.visualRegression ? '✅' : '❌'}

Artifacts Location:
- Screenshots: ./screenshots
- Videos: ./videos
- Traces: ./traces
- Metrics: ./metrics
- Reports: ./reports
`.trim();

    await fs.writeFile(summaryPath, summary);
    console.log(`✅ Test summary saved: ${summaryPath}`);
  } catch (err) {
    console.error('❌ Failed to generate summary:', err);
  }
}

/**
 * 🎨 Helper: Get Status Emoji
 */
function getStatusEmoji(status: StatusValue): string {
  switch (status) {
    case Status.PASSED: return '✅';
    case Status.FAILED: return '❌';
    case Status.SKIPPED: return '⏭️';
    case Status.PENDING: return '⏸️';
    case Status.UNDEFINED: return '❓';
    case Status.AMBIGUOUS: return '⚠️';
    case 'UNKNOWN': return '❔';
    default: return '❔';
  }
}

/**
 * 🔧 Helper: Sanitize filename
 */
function sanitizeFilename(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').substring(0, 100);
}